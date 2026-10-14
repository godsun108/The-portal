import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createSessionStore} from "./sessions.mjs";
import {createAuthenticationFlow} from "./authentication-flow.mjs";

const b64 = bytes => Buffer.from(bytes).toString("base64url");
const sha256 = bytes => createHash("sha256").update(bytes).digest();

function generateSyntheticAuthenticator() {
 const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const jwk=publicKey.export({format:"jwk"});
 const x=Buffer.from(jwk.x,"base64url"),y=Buffer.from(jwk.y,"base64url");
 // CBOR COSE EC2 key: {1:2,3:-7,-1:1,-2:x,-3:y}.
 const cose=new Uint8Array(Buffer.concat([Buffer.from([0xa5,0x01,0x02,0x03,0x26,0x20,0x01,0x21,0x58,0x20]),x,Buffer.from([0x22,0x58,0x20]),y]));
 const id=b64(Buffer.from("earthid-test-credential"));
 const assertion=({challenge,origin="https://id.example.org",rpID="id.example.org",counter=1})=>{
  const clientData=Buffer.from(JSON.stringify({type:"webauthn.get",challenge,origin,crossOrigin:false}));
  const authData=Buffer.concat([sha256(Buffer.from(rpID)),Buffer.from([0x05]),Buffer.alloc(4)]);
  authData.writeUInt32BE(counter,33);
  const signed=Buffer.concat([authData,sha256(clientData)]);
  const signature=sign("sha256",signed,privateKey);
  return {id,rawId:id,type:"public-key",response:{
   clientDataJSON:b64(clientData),authenticatorData:b64(authData),signature:b64(signature)
  },clientExtensionResults:{}};
 };
 return {id,cose,assertion};
}

test("real signed ES256 assertion verifies, commits counter, and issues a session",async()=>{
 const challengeStore=createChallengeStore(),registry=createCredentialRegistry(),sessions=createSessionStore();
 try{
  const device=generateSyntheticAuthenticator();
  assert.equal(registry.addAccount("alice"),true);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:device.id,accountId:"alice",publicKey:device.cose,counter:0}),true);
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry:registry,sessionStore:sessions,
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
  const assertion=device.assertion({challenge});
  const result=await flow.completeAuthentication({accountId:"alice",challenge,response:assertion});
  assert.equal(result.authenticated,true);
  assert.deepEqual(sessions.resolve(result.session.token),{subject:"alice",verified:true});
  assert.equal(registry.getWebAuthnCredential(device.id,"alice").counter,1);
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:assertion}),{authenticated:false});
 }finally{registry.close();}
});

test("validly signed assertion for the wrong origin is denied without counter change or session",async()=>{
 const challengeStore=createChallengeStore(),registry=createCredentialRegistry();
 let issued=0;
 const sessionStore={issue(){issued++;throw Error("session must not issue");}};
 try{
  const device=generateSyntheticAuthenticator();
  registry.addAccount("alice");
  registry.addVerifiedWebAuthnCredential({id:device.id,accountId:"alice",publicKey:device.cose,counter:0});
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry:registry,sessionStore,
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
  const assertion=device.assertion({challenge,origin:"https://attacker.example.org"});
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:assertion}),{authenticated:false});
  assert.equal(issued,0);
  assert.equal(registry.getWebAuthnCredential(device.id,"alice").counter,0);
 }finally{registry.close();}
});
