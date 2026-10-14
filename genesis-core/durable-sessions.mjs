/* EarthID SQLite-backed session store, local integration component only.
 * Calling issue() requires prior independent WebAuthn identity verification.
 * This is not a login endpoint or a production session deployment.
 */
import {randomBytes,createHash} from "node:crypto";
import {DatabaseSync} from "node:sqlite";
const validToken=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const validSubject=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const hashToken=token=>createHash("sha256").update(token).digest("hex");
export function createDurableSessionStore({databasePath=":memory:",now=()=>Date.now(),ttlMs=15*60*1000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||ttlMs>86400000)throw new TypeError("invalid session TTL");
 const db=new DatabaseSync(databasePath);
 db.exec("CREATE TABLE IF NOT EXISTS earthid_sessions(token_hash TEXT PRIMARY KEY,subject TEXT NOT NULL,expires_at INTEGER NOT NULL)");
 const put=db.prepare("INSERT INTO earthid_sessions(token_hash,subject,expires_at) VALUES(?,?,?)");
 const get=db.prepare("SELECT subject,expires_at FROM earthid_sessions WHERE token_hash=?");
 const del=db.prepare("DELETE FROM earthid_sessions WHERE token_hash=?");
 const prune=db.prepare("DELETE FROM earthid_sessions WHERE expires_at<=?");
 const allForUser=db.prepare("DELETE FROM earthid_sessions WHERE subject=?");
 return {
  issue(subject){
   if(!validSubject(subject))throw new TypeError("invalid verified subject");
   const token=randomBytes(32).toString("base64url"),expiresAt=now()+ttlMs;
   if(!Number.isSafeInteger(expiresAt))throw new RangeError("invalid expiration");
   put.run(hashToken(token),subject,expiresAt);
   return {token,expiresAt};
  },
  resolve(token){
   if(!validToken(token))return null;
   const key=hashToken(token),row=get.get(key);
   if(!row)return null;
   if(row.expires_at<=now()){del.run(key);return null;}
   return {subject:row.subject,verified:true};
  },
  revoke(token){
   if(!validToken(token))return false;
   return del.run(hashToken(token)).changes===1;
  },
  revokeSubject(subject){
   if(!validSubject(subject))return 0;
   return allForUser.run(subject).changes;
  },
  purgeExpired(){return prune.run(now()).changes;},
  close(){db.close();}
 };
}
