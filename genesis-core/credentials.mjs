/* Local-only credential metadata registry. This does NOT verify WebAuthn.
 * Never trust caller-supplied credential metadata for real authentication.
 */
import {DatabaseSync} from "node:sqlite";
const validId=x=>typeof x==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(x);
const keyPrefix="webauthn:v1:";
function serializePublicKey(bytes){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<1||bytes.byteLength>4096)return null;
 return keyPrefix+Buffer.from(bytes).toString("base64url");
}
function deserializePublicKey(value){
 if(typeof value!=="string"||!value.startsWith(keyPrefix))return null;
 const encoded=value.slice(keyPrefix.length);
 if(!/^[A-Za-z0-9_-]+$/.test(encoded))return null;
 const decoded=Buffer.from(encoded,"base64url");
 if(decoded.byteLength<1||decoded.byteLength>4096||decoded.toString("base64url")!==encoded)return null;
 return new Uint8Array(decoded);
}
export function createCredentialRegistry(path=":memory:"){
 const db=new DatabaseSync(path);
 db.exec("PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS credentials(id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), public_key TEXT NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0 CHECK(sign_count>=0), revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)));");
 const accountInsert=db.prepare("INSERT INTO accounts(id) VALUES(?)");
 const credentialInsert=db.prepare("INSERT INTO credentials(id,account_id,public_key) VALUES(?,?,?)");
 const lookup=db.prepare("SELECT id,account_id,public_key,sign_count,revoked FROM credentials WHERE id=?");
 const revoke=db.prepare("UPDATE credentials SET revoked=1 WHERE id=? AND account_id=? AND revoked=0");
 const advance=db.prepare("UPDATE credentials SET sign_count=? WHERE id=? AND account_id=? AND revoked=0 AND sign_count=?");
 return {
  addAccount(id){if(!validId(id))return false;try{accountInsert.run(id);return true;}catch{return false;}},
  // Legacy fixture-only method. Do not use to enroll a real passkey.
  addCredential({id,accountId,publicKey}){if(!validId(id)||!validId(accountId)||typeof publicKey!=="string"||publicKey.length<1||publicKey.length>8192)return false;try{credentialInsert.run(id,accountId,publicKey);return true;}catch{return false;}},
  // INTERNAL STORAGE ONLY. Caller must independently confirm the WebAuthn
  // registration ceremony and the account binding before inserting.
  addVerifiedWebAuthnCredential({id,accountId,publicKey}){
   const encoded=serializePublicKey(publicKey);
   if(!validId(id)||!validId(accountId)||!encoded)return false;
   try{credentialInsert.run(id,accountId,encoded);return true;}catch{return false;}
  },
  getCredential(id){if(!validId(id))return null;const r=lookup.get(id);return r?{id:r.id,accountId:r.account_id,publicKey:r.public_key,signCount:r.sign_count,revoked:Boolean(r.revoked)}:null;},
  // Returns the shape expected by SimpleWebAuthn's authentication verifier.
  // Legacy opaque-string fixture records are deliberately excluded.
  getWebAuthnCredential(id,accountId){
   if(!validId(id)||!validId(accountId))return null;
   const r=lookup.get(id);
   if(!r||r.account_id!==accountId||r.revoked!==0)return null;
   const publicKey=deserializePublicKey(r.public_key);
   if(!publicKey)return null;
   return {id:r.id,accountId:r.account_id,publicKey,counter:r.sign_count,revoked:false};
  },
  revokeCredential(id,accountId){if(!validId(id)||!validId(accountId))return false;return revoke.run(id,accountId).changes===1;},
  // Internal storage operation ONLY, called after independently verified WebAuthn.
  commitVerifiedCounter({id,accountId,previousCounter,newCounter}){
   if(!validId(id)||!validId(accountId)||![previousCounter,newCounter].every(x=>Number.isSafeInteger(x)&&x>=0))return false;
   if(newCounter!==0||previousCounter!==0){if(newCounter<=previousCounter)return false;}
   return advance.run(newCounter,id,accountId,previousCounter).changes===1;
  },
  close(){db.close();}
 };
}
