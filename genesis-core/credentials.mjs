/* Local-only credential metadata registry. This does NOT verify WebAuthn.
 * Never trust caller-supplied credential metadata for real authentication.
 */
import {DatabaseSync} from "node:sqlite";
const validId=x=>typeof x==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(x);
export function createCredentialRegistry(path=":memory:"){
 const db=new DatabaseSync(path);
 db.exec("PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS credentials(id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), public_key TEXT NOT NULL, sign_count INTEGER NOT NULL DEFAULT 0 CHECK(sign_count>=0), revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)));");
 const accountInsert=db.prepare("INSERT INTO accounts(id) VALUES(?)");
 const credentialInsert=db.prepare("INSERT INTO credentials(id,account_id,public_key) VALUES(?,?,?)");
 const lookup=db.prepare("SELECT id,account_id,public_key,sign_count,revoked FROM credentials WHERE id=?");
 const revoke=db.prepare("UPDATE credentials SET revoked=1 WHERE id=? AND account_id=? AND revoked=0");
 return {
  addAccount(id){if(!validId(id))return false;try{accountInsert.run(id);return true;}catch{return false;}},
  addCredential({id,accountId,publicKey}){if(!validId(id)||!validId(accountId)||typeof publicKey!=="string"||publicKey.length<1||publicKey.length>8192)return false;try{credentialInsert.run(id,accountId,publicKey);return true;}catch{return false;}},
  getCredential(id){if(!validId(id))return null;const r=lookup.get(id);return r?{id:r.id,accountId:r.account_id,publicKey:r.public_key,signCount:r.sign_count,revoked:Boolean(r.revoked)}:null;},
  revokeCredential(id,accountId){if(!validId(id)||!validId(accountId))return false;return revoke.run(id,accountId).changes===1;},
  close(){db.close();}
 };
}
