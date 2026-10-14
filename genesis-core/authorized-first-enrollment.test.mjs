import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync} from "node:crypto";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createSessionStore} from "./sessions.mjs";
import {createAuthorizedFirstEnrollment} from "./authorized-first-enrollment.mjs";
const origin="https://id.example.org";
const b64=x=>Buffer.from(x).toString("base64url");
const sha=x=>createHash("sha256").update(x).digest();
function makeAttestation(challenge,originOverride=origin){
 const {publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const jwk=publicKey.export({format:"jwk"});
 const idBytes=Buffer.from("first-enrollment-proof");
 const cose=Buffer.concat([Buffer.from([0xa5,1,2,3,0x26,0x20,1,0x21,0x58,0x20]),Buffer.from(jwk.x,"base64url"),Buffer.from([0x22,0x58,0x20]),Buffer.from(jwk.y,"base64url")]);
 const length=Buffer.alloc(2);length.writeUInt16BE(idBytes.length);
 const authData=Buffer.concat([sha(Buffer.from("id.example.org")),Buffer.from([0x45]),Buffer.alloc(4),Buffer.alloc(16),length,idBytes,cose]);
 const size=Buffer.alloc(2);size.writeUInt16BE(authData.length);
 const att=Buffer.concat([Buffer.from([0xa3,0x63,0x66,0x6d,0x74,0x64,0x6e,0x6f,0x6e,0x65,0x67,0x61,0x74,0x74,0x53,0x74,0x6d,0x74,0xa0,0x68,0x61,0x75,0x74,0x68,0x44,0x61,0x74,0x61,0x59]),size,authData]);
 return {id:b64(idBytes),rawId:b64(idBytes),type:"public-key",response:{clientDataJSON:b64(Buffer.from(JSON.stringify({type:"webauthn.create",challenge,origin:originOverride,crossOrigin:false}))),attestationObject:b64(att)},clientExtensionResults:{}};
}
test("trusted first enrollment grant creates verified passkey but never an authenticated session",async()=>{
 const registry=createCredentialRegistry();
 let issued=0;
 const sessions={issue(){issued++;throw Error("enrollment must never issue login");}};
 registry.addAccount("alice");registry.addAccount("bob");
 const flow=createAuthorizedFirstEnrollment({
  credentialRegistry:registry,challengeStore:createChallengeStore(),sessionStore:sessions,
  expectedOrigin:origin,rpID:"id.example.org",trustedAccountLookup:async id=>({id,userName:id})
 });
 try{
  const grant=flow.approveAccount({trustedAccountId:"alice"});
  const started=await flow.beginEnrollment({grant,accountId:"bob"});
  assert.equal(started.options.user.name,"alice");
  assert.equal(await flow.beginEnrollment({grant}),null);
  const response=makeAttestation(started.options.challenge);
  assert.deepEqual(await flow.finishEnrollment({handle:started.handle,response,accountId:"bob"}),{registered:true});
  assert.equal(registry.getWebAuthnCredential(response.id,"alice")?.accountId,"alice");
  assert.equal(registry.getWebAuthnCredential(response.id,"bob"),null);
  assert.deepEqual(await flow.finishEnrollment({handle:started.handle,response}),{registered:false});
  assert.equal(issued,0);
 }finally{registry.close();}
});
test("expired grant and wrong-origin attestation fail closed",async()=>{
 let clock=1000;
 const registry=createCredentialRegistry();registry.addAccount("alice");
 const flow=createAuthorizedFirstEnrollment({
  credentialRegistry:registry,challengeStore:createChallengeStore(),sessionStore:createSessionStore(),
  expectedOrigin:origin,rpID:"id.example.org",trustedAccountLookup:async id=>({id,userName:id}),
  now:()=>clock,ttlMs:30
 });
 try{
  const expired=flow.approveAccount({trustedAccountId:"alice"});
  clock=1030;assert.equal(await flow.beginEnrollment({grant:expired}),null);
  clock=1040;
  const fresh=flow.approveAccount({trustedAccountId:"alice"});
  const begun=await flow.beginEnrollment({grant:fresh});
  assert.deepEqual(await flow.finishEnrollment({handle:begun.handle,response:makeAttestation(begun.options.challenge,"https://attacker.example.org")}),{registered:false});
  assert.equal(registry.getCredential(b64(Buffer.from("first-enrollment-proof"))),null);
 }finally{registry.close();}
});
