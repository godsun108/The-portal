import test from "node:test";
import assert from "node:assert/strict";
import {createCredentialRegistry} from "./credentials.mjs";
test("counter commit is account scoped and rejects stale, revoked, or racing updates",()=>{
 const r=createCredentialRegistry();
 try{
  assert.equal(r.addAccount("alice"),true);assert.equal(r.addAccount("bob"),true);
  assert.equal(r.addCredential({id:"cred1",accountId:"alice",publicKey:"fixture"}),true);
  const commit=(accountId,previousCounter,newCounter)=>r.commitVerifiedCounter({id:"cred1",accountId,previousCounter,newCounter});
  assert.equal(commit("bob",0,1),false);
  assert.equal(commit("alice",0,1),true);
  assert.equal(commit("alice",0,2),false);
  assert.equal(commit("alice",1,1),false);
  assert.equal(commit("alice",1,2),true);
  assert.equal(r.getCredential("cred1").signCount,2);
  assert.equal(r.revokeCredential("cred1","alice"),true);
  assert.equal(commit("alice",2,3),false);
 }finally{r.close();}
});
test("zero-counter authenticators may record zero only if expected state matches",()=>{
 const r=createCredentialRegistry();
 try{
  r.addAccount("alice");r.addCredential({id:"cred1",accountId:"alice",publicKey:"fixture"});
  assert.equal(r.commitVerifiedCounter({id:"cred1",accountId:"alice",previousCounter:0,newCounter:0}),true);
  assert.equal(r.commitVerifiedCounter({id:"cred1",accountId:"alice",previousCounter:0,newCounter:5}),true);
  assert.equal(r.commitVerifiedCounter({id:"cred1",accountId:"alice",previousCounter:5,newCounter:0}),false);
  assert.equal(r.commitVerifiedCounter({id:"cred1",accountId:"alice",previousCounter:5,newCounter:5.5}),false);
  assert.equal(r.commitVerifiedCounter({id:"cred1",accountId:"alice",previousCounter:-1,newCounter:6}),false);
 }finally{r.close();}
});
