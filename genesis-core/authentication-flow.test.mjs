import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createAuthenticationFlow} from "./authentication-flow.mjs";
test("malformed assertion does not issue a session or alter the persisted counter",async()=>{
 const challengeStore=createChallengeStore();
 const credentialRegistry=createCredentialRegistry();
 let issued=0;
 const sessionStore={issue(){issued++;throw new Error("must not issue session");}};
 try{
  credentialRegistry.addAccount("alice");
  assert.equal(credentialRegistry.addVerifiedWebAuthnCredential({
   id:"credential_1",accountId:"alice",publicKey:new Uint8Array([1,2,3,4])
  }),true);
  const flow=createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
  const forged={id:"credential_1",rawId:"YQ",type:"public-key",
   response:{clientDataJSON:"!!!",authenticatorData:"!!!",signature:"!!!"}};
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:forged}),{authenticated:false});
  assert.deepEqual(await flow.completeAuthentication({accountId:"alice",challenge,response:forged}),{authenticated:false});
  assert.equal(credentialRegistry.getWebAuthnCredential("credential_1","alice").counter,0);
  assert.equal(issued,0);
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
