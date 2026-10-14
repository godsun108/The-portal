import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createEnrollmentFlow} from "./enrollment-flow.mjs";
test("invalid registration attestation never writes a credential, including replay",async()=>{
 const challenges=createChallengeStore();
 const registry=createCredentialRegistry();
 try{
  registry.addAccount("alice");
  const flow=createEnrollmentFlow({challengeStore:challenges,credentialRegistry:registry,
    expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const challenge=challenges.issue({accountId:"alice",ceremony:"registration"});
  const response={id:"credential_1",rawId:"YQ",type:"public-key",
    response:{clientDataJSON:"!!!",attestationObject:"!!!"}};
  assert.deepEqual(await flow.completeRegistration({accountId:"alice",challenge,response}),{registered:false});
  assert.deepEqual(await flow.completeRegistration({accountId:"alice",challenge,response}),{registered:false});
  assert.equal(registry.getCredential("credential_1"),null);
 }finally{registry.close();}
});
test("initial signature counter persists and invalid or duplicate registrations are denied",()=>{
 const registry=createCredentialRegistry();
 try{
  registry.addAccount("alice");registry.addAccount("bob");
  const key=new Uint8Array([1,2,3,4]);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"cred1",accountId:"alice",publicKey:key,counter:7}),true);
  assert.equal(registry.getWebAuthnCredential("cred1","alice").counter,7);
  assert.equal(registry.getWebAuthnCredential("cred1","bob"),null);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"cred1",accountId:"bob",publicKey:key,counter:1}),false);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"cred2",accountId:"alice",publicKey:key,counter:-1}),false);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"cred3",accountId:"alice",publicKey:key,counter:1.5}),false);
 }finally{registry.close();}
});
