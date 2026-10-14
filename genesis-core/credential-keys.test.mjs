import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createCredentialRegistry} from "./credentials.mjs";
test("verified WebAuthn credential public keys round-trip as Uint8Array through SQLite",()=>{
 const dir=mkdtempSync(join(tmpdir(),"earthid-keys-"));const path=join(dir,"keys.db");
 const key=new Uint8Array([0,1,254,255,6,9,17,42]);
 try{
  let registry=createCredentialRegistry(path);
  assert.equal(registry.addAccount("alice"),true);
  assert.equal(registry.addAccount("bob"),true);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"credential_1",accountId:"alice",publicKey:key}),true);
  let actual=registry.getWebAuthnCredential("credential_1","alice");
  assert.deepEqual(actual.publicKey,key);assert.equal(actual.counter,0);assert.equal(actual.accountId,"alice");
  assert.equal(registry.getWebAuthnCredential("credential_1","bob"),null);
  assert.equal(registry.addVerifiedWebAuthnCredential({id:"credential_1",accountId:"bob",publicKey:key}),false);
  registry.close();
  registry=createCredentialRegistry(path);
  actual=registry.getWebAuthnCredential("credential_1","alice");
  assert.deepEqual(actual.publicKey,key);
  assert.equal(registry.revokeCredential("credential_1","alice"),true);
  assert.equal(registry.getWebAuthnCredential("credential_1","alice"),null);
  registry.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("unverified fixture keys cannot be mistaken for valid binary WebAuthn credentials",()=>{
 const r=createCredentialRegistry();
 try{
  r.addAccount("alice");
  assert.equal(r.addCredential({id:"legacy",accountId:"alice",publicKey:"synthetic-key"}),true);
  assert.equal(r.getWebAuthnCredential("legacy","alice"),null);
  assert.equal(r.addVerifiedWebAuthnCredential({id:"bad",accountId:"alice",publicKey:"synthetic-key"}),false);
  assert.equal(r.addVerifiedWebAuthnCredential({id:"empty",accountId:"alice",publicKey:new Uint8Array()}),false);
  assert.equal(r.addVerifiedWebAuthnCredential({id:"huge",accountId:"alice",publicKey:new Uint8Array(4097)}),false);
 }finally{r.close();}
});
