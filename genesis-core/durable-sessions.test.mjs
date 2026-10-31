import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createDurableSessionStore} from "./durable-sessions.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createLocalEarthIDService} from "./local-http-service.mjs";
import {once} from "node:events";

test("session persists across restart without storing raw bearer token",()=>{
 const dir=mkdtempSync(join(tmpdir(),"earthid-session-")),databasePath=join(dir,"sessions.db");
 try{
  let sessions=createDurableSessionStore({databasePath});
  const {token}=sessions.issue("alice");
  assert.deepEqual(sessions.resolve(token),{subject:"alice",verified:true});
  sessions.close();
  assert.equal(readFileSync(databasePath).includes(Buffer.from(token)),false);
  sessions=createDurableSessionStore({databasePath});
  assert.deepEqual(sessions.resolve(token),{subject:"alice",verified:true});
  assert.equal(sessions.revoke(token),true);
  assert.equal(sessions.resolve(token),null);
  sessions.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("expiry and account-wide revocation fail closed",()=>{
 let time=1000;
 const sessions=createDurableSessionStore({now:()=>time,ttlMs:50});
 try{
  const a=sessions.issue("alice"),b=sessions.issue("alice"),c=sessions.issue("bob");
  assert.equal(sessions.revokeSubject("alice"),2);
  assert.equal(sessions.resolve(a.token),null);
  assert.equal(sessions.resolve(b.token),null);
  assert.deepEqual(sessions.resolve(c.token),{subject:"bob",verified:true});
  time=1050;
  assert.equal(sessions.resolve(c.token),null);
  assert.equal(sessions.purgeExpired(),0);
  assert.equal(sessions.revoke("invalid"),false);
  assert.throws(()=>sessions.issue("not a valid id"));
 }finally{sessions.close();}
});
test("device-bound revocation invalidates only that account's sessions for that device",()=>{
 const sessions=createDurableSessionStore();
 const phone="A".repeat(32),tablet="B".repeat(32);
 try{
  const phoneA=sessions.issue("alice",{deviceId:phone});
  const phoneB=sessions.issue("alice",{deviceId:phone});
  const tabletA=sessions.issue("alice",{deviceId:tablet});
  const other=sessions.issue("bob",{deviceId:phone});
  assert.deepEqual(sessions.resolve(phoneA.token),{subject:"alice",verified:true,deviceId:phone});
  assert.equal(sessions.revokeDevice("alice",phone),2);
  assert.equal(sessions.resolve(phoneA.token),null);
  assert.equal(sessions.resolve(phoneB.token),null);
  assert.deepEqual(sessions.resolve(tabletA.token),{subject:"alice",verified:true,deviceId:tablet});
  assert.deepEqual(sessions.resolve(other.token),{subject:"bob",verified:true,deviceId:phone});
  assert.equal(sessions.revokeDevice("alice","wrong"),0);
  assert.throws(()=>sessions.issue("alice",{deviceId:"not-a-device"}));
 }finally{sessions.close();}
});
test("legacy session database migrates and keeps unbound sessions valid",()=>{
 const dir=mkdtempSync(join(tmpdir(),"earthid-session-migrate-")),databasePath=join(dir,"sessions.db");
 try{
  let sessions=createDurableSessionStore({databasePath});
  const {token}=sessions.issue("alice");
  sessions.close();
  sessions=createDurableSessionStore({databasePath});
  assert.deepEqual(sessions.resolve(token),{subject:"alice",verified:true});
  const device="C".repeat(32),bound=sessions.issue("alice",{deviceId:device});
  assert.equal(sessions.revokeDevice("alice",device),1);
  assert.equal(sessions.resolve(bound.token),null);
  assert.deepEqual(sessions.resolve(token),{subject:"alice",verified:true});
  sessions.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("credential-bound sessions fail closed if credential is revoked while session row remains",()=>{
 const dir=mkdtempSync(join(tmpdir(),"earthid-session-credential-active-")),databasePath=join(dir,"identity.db");
 const sessions=createDurableSessionStore({databasePath});
 const credentials=createCredentialRegistry(databasePath);
 try{
  credentials.addAccount("alice");
  credentials.addVerifiedWebAuthnCredential({id:"alice_key_1",accountId:"alice",publicKey:new Uint8Array([1,2,3])});
  const bound=sessions.issue("alice",{credentialId:"alice_key_1"});
  assert.deepEqual(sessions.resolve(bound.token),{subject:"alice",verified:true,credentialId:"alice_key_1"});
  credentials.revokeCredential("alice_key_1","alice");
  // Deliberately leave the session row behind: resolution itself must check
  // credential state, not rely exclusively on the revocation cleanup path.
  assert.equal(sessions.resolve(bound.token),null);
 }finally{
  sessions.close();credentials.close();rmSync(dir,{recursive:true,force:true});
 }
});
test("loopback private resource denies revoked durable session",async()=>{
 const sessions=createDurableSessionStore();
 const token=sessions.issue("alice").token;
 const {server,closeDatabase}=createLocalEarthIDService({sessions,trustedOrigin:"https://id.example.org"});
 server.listen(0,"127.0.0.1");await once(server,"listening");
 const url="http://127.0.0.1:"+server.address().port;
 try{
  const headers={Cookie:"__Host-earthid="+token,Origin:"https://id.example.org"};
  const created=await fetch(url+"/notes",{method:"POST",headers,body:JSON.stringify({id:"durable_note",body:"private"})});
  assert.equal(created.status,201);
  assert.equal((await fetch(url+"/notes/durable_note",{headers})).status,200);
  assert.equal(sessions.revoke(token),true);
  assert.equal((await fetch(url+"/notes/durable_note",{headers})).status,401);
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  closeDatabase();sessions.close();
 }
});
