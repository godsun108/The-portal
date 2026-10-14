import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createBrowserPasskeyOptions} from "./browser-passkey-options.mjs";
test("generates browser-compatible registration options from trusted server identity",async()=>{
 const builder=createBrowserPasskeyOptions({challengeStore:createChallengeStore(),rpID:"id.example.org"});
 const x=await builder.registration({trustedAccountId:"alice",trustedUserName:"Alice"});
 assert.equal(x.rp.id,"id.example.org");
 assert.equal(x.user.name,"Alice");
 assert.equal(x.user.id.length>0,true);
 assert.equal(x.challenge.length,43);
 assert.equal(x.authenticatorSelection.userVerification,"required");
 assert.equal(x.authenticatorSelection.residentKey,"required");
 assert.equal(x.attestation,"none");
 assert.ok(x.pubKeyCredParams.some(k=>k.alg===-7));
 const y=await builder.registration({trustedAccountId:"alice",trustedUserName:"Alice"});
 assert.notEqual(x.challenge,y.challenge);
 assert.equal(x.user.id,y.user.id);
});
test("generates browser-compatible authentication options with required user verification",async()=>{
 const builder=createBrowserPasskeyOptions({challengeStore:createChallengeStore(),rpID:"id.example.org"});
 const x=await builder.authentication({trustedAccountId:"alice"});
 assert.equal(x.rpId,"id.example.org");
 assert.equal(x.userVerification,"required");
 assert.equal(x.challenge.length,43);
 assert.deepEqual(x.allowCredentials,[]);
});
test("rejects untrusted identities and malformed credential IDs",async()=>{
 const builder=createBrowserPasskeyOptions({challengeStore:createChallengeStore(),rpID:"id.example.org"});
 await assert.rejects(()=>builder.registration({trustedAccountId:"../bob",trustedUserName:"Bob"}));
 await assert.rejects(()=>builder.authentication({trustedAccountId:"alice",allowCredentialIds:["not valid!"]}));
 await assert.rejects(()=>builder.registration({trustedAccountId:"alice",trustedUserName:" ",excludeCredentialIds:[]}));
});
