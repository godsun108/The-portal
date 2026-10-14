import test from "node:test";
import assert from "node:assert/strict";
import {createSessionStore} from "./sessions.mjs";
test("sessions are unique opaque tokens and resolve to trusted subjects",()=>{
 const store=createSessionStore();const a=store.issue("alice"),b=store.issue("alice");
 assert.notEqual(a.token,b.token);
 assert.deepEqual(store.resolve(a.token),{subject:"alice",verified:true});
 assert.equal(store.resolve("invalid"),null);
});
test("expired sessions are rejected",()=>{
 let clock=1000;const store=createSessionStore({now:()=>clock,ttlMs:100});
 const s=store.issue("bob");clock=1100;assert.equal(store.resolve(s.token),null);
});
test("revoked sessions cannot be used",()=>{
 const store=createSessionStore();const s=store.issue("alice");
 assert.equal(store.revoke(s.token),true);assert.equal(store.resolve(s.token),null);
 assert.equal(store.revoke(s.token),false);
});
test("rejects malformed subject and invalid TTL",()=>{
 const store=createSessionStore();assert.throws(()=>store.issue("a b"));
 assert.throws(()=>createSessionStore({ttlMs:0}));
});
test("sessions never accept client-supplied identities",()=>{
 const store=createSessionStore();const s=store.issue("alice");
 assert.equal(store.resolve(s.token+"x"),null);
 assert.deepEqual(store.resolve(s.token),{subject:"alice",verified:true});
});
