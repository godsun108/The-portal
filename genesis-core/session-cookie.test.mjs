import test from "node:test";
import assert from "node:assert/strict";
import {createSessionCookie,clearSessionCookie,readSessionCookie} from "./session-cookie.mjs";
import {createSessionStore} from "./sessions.mjs";
test("secure cookie contains only opaque token and restricts browser access",()=>{
 const store=createSessionStore();const session=store.issue("alice");
 const cookie=createSessionCookie({token:session.token,maxAgeSeconds:300});
 assert.match(cookie,/^__Host-earthid=/);
 for(const flag of ["Path=/","Secure","HttpOnly","SameSite=Strict","Max-Age=300"])
  assert.ok(cookie.includes(flag),flag);
 assert.equal(readSessionCookie(cookie.split(";")[0]),session.token);
 assert.deepEqual(store.resolve(readSessionCookie(cookie)),{subject:"alice",verified:true});
});
test("session-cookie parser fails closed for duplicates, malformed and oversized input",()=>{
 const token=createSessionStore().issue("alice").token;
 assert.equal(readSessionCookie("__Host-earthid="+token+"; __Host-earthid="+token),null);
 assert.equal(readSessionCookie("__Host-earthid=bad"),null);
 assert.equal(readSessionCookie("foo=bar"),null);
 assert.equal(readSessionCookie("x".repeat(8193)),null);
 assert.throws(()=>createSessionCookie({token:"bad"}));
 assert.throws(()=>createSessionCookie({token,maxAgeSeconds:90000}));
});
test("logout cookie expires browser-held session reference",()=>{
 assert.equal(clearSessionCookie(),"__Host-earthid=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0");
});
