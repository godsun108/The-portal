/* EarthID SQLite-backed session store, local integration component only.
 * Calling issue() requires prior independent WebAuthn identity verification.
 * A deviceId is trusted server-side metadata, never authentication proof.
 * This is not a login endpoint or a production session deployment.
 */
import {randomBytes,createHash} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
const validToken=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const validSubject=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validDeviceId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{32}$/.test(s);
const validCredentialId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const hashToken=token=>createHash("sha256").update(token).digest("hex");
export function createDurableSessionStore({databasePath=":memory:",now=()=>Date.now(),ttlMs=15*60*1000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||ttlMs>86400000)throw new TypeError("invalid session TTL");
 const db=new DatabaseSync(databasePath);
 db.exec("CREATE TABLE IF NOT EXISTS earthid_sessions(token_hash TEXT PRIMARY KEY,subject TEXT NOT NULL,expires_at INTEGER NOT NULL)");
 // Backward-compatible migration for databases created before device binding.
 const columns=db.prepare("PRAGMA table_info(earthid_sessions)").all();
 if(!columns.some(column=>column.name==="device_id"))db.exec("ALTER TABLE earthid_sessions ADD COLUMN device_id TEXT");
 if(!columns.some(column=>column.name==="credential_id"))db.exec("ALTER TABLE earthid_sessions ADD COLUMN credential_id TEXT");
 db.exec("CREATE INDEX IF NOT EXISTS earthid_sessions_subject_device_idx ON earthid_sessions(subject,device_id)");
 const credentialSchema=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='credentials'").get();
 const credentialTableExists=Boolean(credentialSchema);
 const activeCredential=credentialTableExists
  ?db.prepare("SELECT 1 FROM credentials WHERE id=? AND account_id=? AND revoked=0")
  :null;
 const put=db.prepare("INSERT INTO earthid_sessions(token_hash,subject,expires_at,device_id,credential_id) VALUES(?,?,?,?,?)");
 const get=db.prepare("SELECT subject,expires_at,device_id,credential_id FROM earthid_sessions WHERE token_hash=?");
 const del=db.prepare("DELETE FROM earthid_sessions WHERE token_hash=?");
 const prune=db.prepare("DELETE FROM earthid_sessions WHERE expires_at<=?");
 const allForUser=db.prepare("DELETE FROM earthid_sessions WHERE subject=?");
 const allForDevice=db.prepare("DELETE FROM earthid_sessions WHERE subject=? AND device_id=?");
 return {
  issue(subject,{deviceId=null,credentialId=null}={}){
   if(!validSubject(subject))throw new TypeError("invalid verified subject");
   if(deviceId!==null&&!validDeviceId(deviceId))throw new TypeError("invalid verified device id");
   if(credentialId!==null&&!validCredentialId(credentialId))throw new TypeError("invalid verified credential id");
   const token=randomBytes(32).toString("base64url"),expiresAt=now()+ttlMs;
   if(!Number.isSafeInteger(expiresAt))throw new RangeError("invalid expiration");
   const insert=()=>put.run(hashToken(token),subject,expiresAt,deviceId,credentialId);
   if(credentialId!==null&&credentialTableExists){
    // BEGIN IMMEDIATE serializes this check+insert against credential revocation.
    // If issuance wins, revocation subsequently deletes the session; if revocation
    // wins, this query sees revoked=1 and issuance fails closed.
    db.exec("BEGIN IMMEDIATE");
    try{
     if(!activeCredential.get(credentialId,subject)){
      db.exec("ROLLBACK");
      throw new Error("credential_not_active");
     }
     insert();
     db.exec("COMMIT");
    }catch(error){
     try{db.exec("ROLLBACK");}catch{}
     throw error;
    }
   }else insert();
   return {token,expiresAt};
  },
  resolve(token){
   if(!validToken(token))return null;
   const key=hashToken(token),row=get.get(key);
   if(!row)return null;
   if(row.expires_at<=now()){del.run(key);return null;}
   if(row.credential_id&&credentialTableExists&&!activeCredential.get(row.credential_id,row.subject)){
    del.run(key);
    return null;
   }
   return {subject:row.subject,verified:true,...(row.device_id?{deviceId:row.device_id}:{}),...(row.credential_id?{credentialId:row.credential_id}:{})};
  },
  revoke(token){
   if(!validToken(token))return false;
   return del.run(hashToken(token)).changes===1;
  },
  revokeDevice(subject,deviceId){
   if(!validSubject(subject)||!validDeviceId(deviceId))return 0;
   return allForDevice.run(subject,deviceId).changes;
  },
  revokeSubject(subject){
   if(!validSubject(subject))return 0;
   return allForUser.run(subject).changes;
  },
  purgeExpired(){return prune.run(now()).changes;},
  close(){db.close();}
 };
}
