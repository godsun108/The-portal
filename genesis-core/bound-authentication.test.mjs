import test from "node:test";
import assert from "node:assert/strict";
import {createCeremonyBindingStore} from "./ceremony-binding.mjs";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createBoundAuthentication} from "./bound-authentication.mjs";
test("ceremony handle resolves account server-side and cannot be replayed or swapped",()=>{
 let clock=1000;
 const store=createCeremonyBindingStore({now:()=>clock,ttlMs:50});
 const challenge="a".repeat(43);
 const handle=store.issue({trustedAccountId:"alice",ceremony:"authentication",challenge});
 assert.equal(store.consume({handle,challenge:"b".repeat(43),ceremony:"authentication"}),null);
 assert.equal(store.consume({handle,challenge,ceremony:"authentication"}),null);
 const next=store.issue({trustedAccountId:"alice",ceremony:"authentication",challenge});
 assert.deepEqual(store.consume({handle:next,challenge,ceremony:"authentication"}),{
  accountId:"alice",challenge,ceremony:"authentication"
 });
 assert.equal(store.consume({handle:next,challenge,ceremony:"authentication"}),null);
 const expired=store.issue({trustedAccountId:"bob",ceremony:"authentication",challenge});
 clock=1050;
 assert.equal(store.consume({handle:expired,challenge,ceremony:"authentication"}),null);
});
test("bound flow rejects client-claimed account and malformed assertion without issuing session",async()=>{
 const challenges=createChallengeStore();
 const bindings=createCeremonyBindingStore();
 const credentials=createCredentialRegistry();
 let sessionsIssued=0;
 try{
  credentials.addAccount("alice");credentials.addAccount("bob");
  const flow=createBoundAuthentication({challengeStore:challenges,ceremonyBindings:bindings,
   credentialRegistry:credentials,sessionStore:{issue(){sessionsIssued++;throw Error("unexpected");}},
   expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org"});
  const {handle,challenge}=flow.beginAuthentication("alice");
  const result=await flow.completeAuthentication({
   handle,challenge,accountId:"bob",response:{id:"unregistered"}
  });
  assert.deepEqual(result,{authenticated:false});
  assert.deepEqual(await flow.completeAuthentication({
   handle,challenge,response:{id:"unregistered"}
  }),{authenticated:false});
  assert.equal(sessionsIssued,0);
 }finally{credentials.close();}
});
test("binding rejects invalid context and mismatched ceremony",()=>{
 const store=createCeremonyBindingStore();
 assert.throws(()=>store.issue({trustedAccountId:"../bad",ceremony:"authentication",challenge:"a".repeat(43)}));
 const challenge="a".repeat(43);
 const handle=store.issue({trustedAccountId:"alice",ceremony:"registration",challenge});
 assert.equal(store.consume({handle,challenge,ceremony:"authentication"}),null);
});
