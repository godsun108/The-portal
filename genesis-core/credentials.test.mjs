import test from "node:test";
import assert from "node:assert/strict";
import {createCredentialRegistry} from "./credentials.mjs";
test("account-bound credential registry enforces uniqueness and ownership",()=>{
 const db=createCredentialRegistry();
 try{
  assert.equal(db.addAccount("alice"),true);assert.equal(db.addAccount("bob"),true);
  assert.equal(db.addCredential({id:"credential_1",accountId:"alice",publicKey:"synthetic-key"}),true);
  assert.equal(db.addCredential({id:"credential_1",accountId:"bob",publicKey:"other-key"}),false);
  assert.equal(db.revokeCredential("credential_1","bob"),false);
  assert.equal(db.getCredential("credential_1").revoked,false);
  assert.equal(db.revokeCredential("credential_1","alice"),true);
  assert.equal(db.getCredential("credential_1").revoked,true);
  assert.equal(db.revokeCredential("credential_1","alice"),false);
 }finally{db.close();}
});
test("credentials require existing accounts and valid identifiers",()=>{
 const db=createCredentialRegistry();
 try{
  assert.equal(db.addCredential({id:"orphan",accountId:"missing",publicKey:"key"}),false);
  assert.equal(db.addAccount("../invalid"),false);
  assert.equal(db.addAccount("alice"),true);
  assert.equal(db.addCredential({id:"bad id",accountId:"alice",publicKey:"key"}),false);
  assert.equal(db.addCredential({id:"valid",accountId:"alice",publicKey:""}),false);
 }finally{db.close();}
});
