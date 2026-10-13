import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
test("challenge is one-time and bound to account and ceremony",()=>{
 const store=createChallengeStore();
 const challenge=store.issue({accountId:"alice",ceremony:"registration"});
 assert.equal(store.consume({challenge,accountId:"alice",ceremony:"registration"}),true);
 assert.equal(store.consume({challenge,accountId:"alice",ceremony:"registration"}),false);
});
test("wrong account cannot consume another account challenge",()=>{
 const store=createChallengeStore();
 const challenge=store.issue({accountId:"alice",ceremony:"authentication"});
 assert.equal(store.consume({challenge,accountId:"bob",ceremony:"authentication"}),false);
 assert.equal(store.consume({challenge,accountId:"alice",ceremony:"authentication"}),false);
});
test("wrong ceremony fails closed",()=>{
 const store=createChallengeStore();
 const challenge=store.issue({accountId:"alice",ceremony:"registration"});
 assert.equal(store.consume({challenge,accountId:"alice",ceremony:"authentication"}),false);
});
test("expired challenge rejected",()=>{
 let clock=100;const store=createChallengeStore({now:()=>clock,ttlMs:50});
 const challenge=store.issue({accountId:"alice",ceremony:"authentication"});
 clock=150;assert.equal(store.consume({challenge,accountId:"alice",ceremony:"authentication"}),false);
});
test("invalid challenge context and malformed challenge rejected",()=>{
 const store=createChallengeStore();
 assert.throws(()=>store.issue({accountId:"../bad",ceremony:"registration"}));
 assert.throws(()=>store.issue({accountId:"alice",ceremony:"other"}));
 assert.equal(store.consume({challenge:"garbage",accountId:"alice",ceremony:"registration"}),false);
});
