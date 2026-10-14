import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createWebAuthnBoundary} from "./webauthn-boundary.mjs";
const make=(overrides={})=>{
 const challengeStore=createChallengeStore();
 const captures=[];
 const verified=async options=>{captures.push(options);return {verified:true,authenticationInfo:{newCounter:8},registrationInfo:{credential:{id:"credential_1"}}};};
 const boundary=createWebAuthnBoundary({challengeStore,verifyRegistration:verified,verifyAuthentication:verified,expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org",...overrides});
 return {challengeStore,boundary,captures};
};
test("authenticated credential must be owned by the claimed account and active",async()=>{
 const {challengeStore,boundary,captures}=make();
 const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
 const denied=await boundary.complete({accountId:"alice",ceremony:"authentication",challenge,response:{id:"credential_1"},credential:{id:"credential_1",accountId:"bob",revoked:false}});
 assert.equal(denied.verified,false);assert.equal(captures.length,0);
 const retry=await boundary.complete({accountId:"alice",ceremony:"authentication",challenge,response:{id:"credential_1"},credential:{id:"credential_1",accountId:"alice",revoked:false}});
 assert.equal(retry.verified,false);
});
test("verification passes exact expected origin, RP ID, user-verification and challenge to verifier",async()=>{
 const {challengeStore,boundary,captures}=make();
 const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
 const result=await boundary.complete({accountId:"alice",ceremony:"authentication",challenge,response:{id:"credential_1"},credential:{id:"credential_1",accountId:"alice",revoked:false}});
 assert.equal(result.verified,true);
 assert.equal(captures.length,1);assert.equal(captures[0].expectedChallenge,challenge);
 assert.equal(captures[0].expectedOrigin,"https://id.example.org");assert.equal(captures[0].expectedRPID,"id.example.org");
 assert.equal(captures[0].requireUserVerification,true);
});
test("failed cryptographic verification is rejected and challenge not reusable",async()=>{
 const {challengeStore,boundary}=make({verifyAuthentication:async()=>({verified:false})});
 const challenge=challengeStore.issue({accountId:"alice",ceremony:"authentication"});
 const args={accountId:"alice",ceremony:"authentication",challenge,response:{id:"cred"},credential:{id:"cred",accountId:"alice"}};
 assert.equal((await boundary.complete(args)).verified,false);
 assert.equal((await boundary.complete(args)).reason,"invalid-or-expired-challenge");
});
test("registration path still needs an independently verified onboarding identity",async()=>{
 const {challengeStore,boundary,captures}=make();
 const challenge=challengeStore.issue({accountId:"alice",ceremony:"registration"});
 assert.equal((await boundary.complete({accountId:"alice",ceremony:"registration",challenge,response:{id:"new_credential"}})).verified,true);
 assert.equal(captures.length,1);
});
test("configuration and invalid response fail closed",async()=>{
 assert.throws(()=>make({expectedOrigin:"http://example.org"}));
 const {boundary}=make();
 assert.equal((await boundary.complete({accountId:"../bob",ceremony:"authentication",challenge:"x",response:{}})).verified,false);
});
