import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createAuthenticationFlow} from "./authentication-flow.mjs";
test("malformed assertion does not issue a session or alter the persisted counter",async()=>{
 const challengeStore=createChallengeStore();
 const credentialRegistry=createCredentialRegistry();
 let issued=0,deviceCalls=0;
 const deviceInventory={
  touch(){deviceCalls++;return false;},
  list(){deviceCalls++;return [];},
  enroll(){deviceCalls++;throw new Error("must not enroll an unverified device");}
 };
 const sessionStore={issue(){issued++;throw new Error("must not issue session");}};
 try{
  credentialRegistry.addAccount("alice");
  assert.equal(credentialRegistry.addVerifiedWebAuthnCredential({
   id:"credential_1",accountId:"alice",publicKey:new Uint8Array([1,2,3,4])
  }),true);
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org",deviceInventory});
  const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
  const forged={id:"credential_1",rawId:"YQ",type:"public-key",
   response:{clientDataJSON:"!!!",authenticatorData:"!!!",signature:"!!!"}};
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:forged,device:{label:"My iPhone",platform:"ios"}}),{authenticated:false});
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:forged}),{authenticated:false});
  assert.equal(credentialRegistry.getWebAuthnCredential("credential_1","alice").counter,0);
  assert.equal(issued,0);
  assert.equal(deviceCalls,0,"unverified assertions must not inspect or enroll devices");
 }finally{credentialRegistry.close();}
});
test("cross-account and revoked credentials never issue a session",async()=>{
 const challengeStore=createChallengeStore();
 const credentialRegistry=createCredentialRegistry();
 let issued=0;
 const sessionStore={issue(){issued++;throw new Error("unexpected session issuance");}};
 try{
  credentialRegistry.addAccount("alice");credentialRegistry.addAccount("bob");
  credentialRegistry.addVerifiedWebAuthnCredential({
   id:"credential_1",accountId:"alice",publicKey:new Uint8Array([1,2,3])
  });
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const attempt=async accountId=>{
   const challenge=challengeStore.issue({accountId,ceremony:"authentication"});
   return flow.completeAuthentication({accountId,challenge,response:{id:"credential_1"}});
  };
  assert.deepEqual(await attempt("bob"),{authenticated:false});
  credentialRegistry.revokeCredential("credential_1","alice");
  assert.deepEqual(await attempt("alice"),{authenticated:false});
  assert.equal(issued,0);
 }finally{credentialRegistry.close();}
});

import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createDeviceInventory} from "./device-inventory.mjs";
import {createEnrollmentFlow} from "./enrollment-flow.mjs";

const b64=x=>Buffer.from(x).toString("base64url");
const hash=x=>createHash("sha256").update(x).digest();
const origin="https://id.example.org",rpID="id.example.org";
function signedTestAuthenticator(){
 const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const jwk=publicKey.export({format:"jwk"});
 const x=Buffer.from(jwk.x,"base64url"),y=Buffer.from(jwk.y,"base64url");
 const cose=Buffer.concat([Buffer.from([0xa5,1,2,3,0x26,0x20,1,0x21,0x58,0x20]),x,Buffer.from([0x22,0x58,0x20]),y]);
 const credentialId=Buffer.from("earthid-device-cap-test"),id=b64(credentialId);
 const client=(type,challenge)=>Buffer.from(JSON.stringify({type,challenge,origin,crossOrigin:false}));
 function attestation(challenge){
  const clientData=client("webauthn.create",challenge);
  const credentialLength=Buffer.alloc(2);credentialLength.writeUInt16BE(credentialId.length);
  const authData=Buffer.concat([hash(Buffer.from(rpID)),Buffer.from([0x45]),Buffer.alloc(4),Buffer.alloc(16),credentialLength,credentialId,cose]);
  const length=Buffer.alloc(2);length.writeUInt16BE(authData.length);
  const attestationObject=Buffer.concat([Buffer.from([0xa3,0x63,0x66,0x6d,0x74,0x64,0x6e,0x6f,0x6e,0x65,0x67,0x61,0x74,0x74,0x53,0x74,0x6d,0x74,0xa0,0x68,0x61,0x75,0x74,0x68,0x44,0x61,0x74,0x61,0x59]),length,authData]);
  return {id,rawId:id,type:"public-key",response:{clientDataJSON:b64(clientData),attestationObject:b64(attestationObject)},clientExtensionResults:{}};
 }
 function assertion(challenge,counter=1){
  const clientData=client("webauthn.get",challenge);
  const authData=Buffer.concat([hash(Buffer.from(rpID)),Buffer.from([0x05]),Buffer.alloc(4)]);
  authData.writeUInt32BE(counter,33);
  const signature=sign("sha256",Buffer.concat([authData,hash(clientData)]),privateKey);
  return {id,rawId:id,type:"public-key",response:{clientDataJSON:b64(clientData),authenticatorData:b64(authData),signature:b64(signature)},clientExtensionResults:{}};
 }
 return {id,attestation,assertion};
}

test("valid signed assertion at device cap is denied without issuing a session",async()=>{
 const challengeStore=createChallengeStore(),credentialRegistry=createCredentialRegistry();
 const deviceInventory=createDeviceInventory({maxActiveDevices:1});
 let issued=0;
 const sessionStore={issue(){issued++;throw new Error("must not issue session at device cap");}};
 try{
  credentialRegistry.addAccount("alice");
  const device=signedTestAuthenticator();
  const registration=createEnrollmentFlow({challengeStore,credentialRegistry,expectedOrigin:origin,expectedRPID:rpID});
  const regChallenge=challengeStore.issue({accountId:"alice",ceremony:"registration"});
  assert.deepEqual(await registration.completeRegistration({accountId:"alice",challenge:regChallenge,response:device.attestation(regChallenge)}),{registered:true});
  deviceInventory.enroll("alice",{label:"Existing iPhone",platform:"ios"});
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,deviceInventory,expectedOrigin:origin,expectedRPID:rpID});
  const authChallenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
  const result=await flow.completeAuthentication({accountId:"alice",challenge:authChallenge,response:device.assertion(authChallenge),device:{label:"New iPhone",platform:"ios"}});
  assert.deepEqual(result,{authenticated:false,reason:"device_enrollment_required"});
  assert.equal(credentialRegistry.getWebAuthnCredential(device.id,"alice").counter,1,"verified assertion counter is committed");
  assert.equal(deviceInventory.list("alice").length,1,"device cap is not bypassed");
  assert.equal(issued,0,"no session is issued when enrollment is denied");
 }finally{credentialRegistry.close();deviceInventory.close();}
});
