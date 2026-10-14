import test from "node:test";
import assert from "node:assert/strict";
import {createCredentialRegistry} from "./credentials.mjs";
import {createTrustedOnboarding} from "./trusted-onboarding.mjs";
test("operator-approved invitation creates only the predetermined identity",()=>{
 const registry=createCredentialRegistry();
 try{
  const onboarding=createTrustedOnboarding({credentialRegistry:registry});
  const secret=onboarding.issueInvitation({approvedAccountId:"alice"});
  assert.equal(secret.length,43);
  assert.deepEqual(onboarding.redeemInvitation({secret,accountId:"bob"}),{provisioned:true,accountId:"alice"});
  assert.deepEqual(onboarding.redeemInvitation({secret}),{provisioned:false});
  assert.equal(registry.addAccount("alice"),false);
  assert.equal(registry.addAccount("bob"),true);
 }finally{registry.close();}
});
test("expired and malformed invitations deny and cannot be retried",()=>{
 const registry=createCredentialRegistry();let clock=1000;
 try{
  const onboarding=createTrustedOnboarding({credentialRegistry:registry,ttlMs:30,now:()=>clock});
  const expired=onboarding.issueInvitation({approvedAccountId:"alice"});
  assert.deepEqual(onboarding.redeemInvitation({secret:"bad"}),{provisioned:false});
  clock=1030;
  assert.deepEqual(onboarding.redeemInvitation({secret:expired}),{provisioned:false});
  clock=1001;
  assert.deepEqual(onboarding.redeemInvitation({secret:expired}),{provisioned:false});
  assert.equal(registry.addAccount("alice"),true);
  assert.throws(()=>onboarding.issueInvitation({approvedAccountId:"../bad"}));
 }finally{registry.close();}
});
test("duplicate account consumes invitation and prevents registration bootstrap takeover",()=>{
 const registry=createCredentialRegistry();
 try{
  registry.addAccount("alice");
  const onboarding=createTrustedOnboarding({credentialRegistry:registry});
  const secret=onboarding.issueInvitation({approvedAccountId:"alice"});
  assert.deepEqual(onboarding.redeemInvitation({secret}),{provisioned:false});
  assert.deepEqual(onboarding.redeemInvitation({secret}),{provisioned:false});
 }finally{registry.close();}
});
