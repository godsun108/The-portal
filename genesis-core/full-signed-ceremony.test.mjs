import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createDurableSessionStore} from "./durable-sessions.mjs";
import {createEnrollmentFlow} from "./enrollment-flow.mjs";
import {createAuthenticationFlow} from "./authentication-flow.mjs";

const b64=x=>Buffer.from(x).toString("base64url");
const hash=x=>createHash("sha256").update(x).digest();
const origin="https://id.example.org",rpID="id.example.org";
function authenticator(){
 const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const jwk=publicKey.export({format:"jwk"});
 const x=Buffer.from(jwk.x,"base64url"),y=Buffer.from(jwk.y,"base64url");
 const cose=Buffer.concat([Buffer.from([0xa5,1,2,3,0x26,0x20,1,0x21,0x58,0x20]),x,Buffer.from([0x22,0x58,0x20]),y]);
 const credentialId=Buffer.from("earthid-full-ceremony");
 const id=b64(credentialId);
 const client=(type,challenge,claimedOrigin=origin)=>Buffer.from(JSON.stringify({type,challenge,origin:claimedOrigin,crossOrigin:false}));
 function attestation(challenge,claimedOrigin=origin){
  const clientData=client("webauthn.create",challenge,claimedOrigin);
  const credentialLength=Buffer.alloc(2);credentialLength.writeUInt16BE(credentialId.length);
  const authData=Buffer.concat([hash(Buffer.from(rpID)),Buffer.from([0x45]),Buffer.alloc(4),Buffer.alloc(16),credentialLength,credentialId,cose]);
  const length=Buffer.alloc(2);length.writeUInt16BE(authData.length);
  const attestationObject=Buffer.concat([
   Buffer.from([0xa3,0x63,0x66,0x6d,0x74,0x64,0x6e,0x6f,0x6e,0x65]),
   Buffer.from([0x67,0x61,0x74,0x74,0x53,0x74,0x6d,0x74,0xa0]),
   Buffer.from([0x68,0x61,0x75,0x74,0x68,0x44,0x61,0x74,0x61,0x59]),length,authData
  ]);
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
test("synthetic authenticator completes verified registration then signed login",async()=>{
 const challenges=createChallengeStore(),registry=createCredentialRegistry(),sessions=createDurableSessionStore();
 try{
  const device=authenticator();
  assert.equal(registry.addAccount("alice"),true);
  const registration=createEnrollmentFlow({challengeStore:challenges,credentialRegistry:registry,expectedOrigin:origin,expectedRPID:rpID});
  const regChallenge=challenges.issue({accountId:"alice",ceremony:"registration"});
  const reg=device.attestation(regChallenge);
  assert.deepEqual(await registration.completeRegistration({accountId:"alice",challenge:regChallenge,response:reg}),{registered:true});
  assert.equal(registry.getWebAuthnCredential(device.id,"alice")?.counter,0);
  assert.deepEqual(await registration.completeRegistration({accountId:"alice",challenge:regChallenge,response:reg}),{registered:false});
  const auth=createAuthenticationFlow({challengeStore:challenges,credentialRegistry:registry,sessionStore:sessions,expectedOrigin:origin,expectedRPID:rpID});
  const authChallenge=challenges.issue({accountId:"alice",ceremony:"authentication"});
  const result=await auth.completeAuthentication({accountId:"alice",challenge:authChallenge,response:device.assertion(authChallenge)});
  assert.equal(result.authenticated,true);
  assert.deepEqual(sessions.resolve(result.session.token),{subject:"alice",verified:true,credentialId:device.id});
  assert.equal(registry.getWebAuthnCredential(device.id,"alice").counter,1);
  assert.equal(sessions.revoke(result.session.token),true);
  assert.equal(sessions.resolve(result.session.token),null);
 }finally{registry.close();sessions.close();}
});
test("wrong-origin registration cannot persist credential",async()=>{
 const challenges=createChallengeStore(),registry=createCredentialRegistry();
 try{
  registry.addAccount("alice");
  const device=authenticator();
  const registration=createEnrollmentFlow({challengeStore:challenges,credentialRegistry:registry,expectedOrigin:origin,expectedRPID:rpID});
  const challenge=challenges.issue({accountId:"alice",ceremony:"registration"});
  const response=device.attestation(challenge,"https://attacker.example.org");
  assert.deepEqual(await registration.completeRegistration({accountId:"alice",challenge,response}),{registered:false});
  assert.equal(registry.getCredential(device.id),null);
 }finally{registry.close();}
});
