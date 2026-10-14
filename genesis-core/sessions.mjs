/* Local session primitive, not an authentication system. The trusted server
 * must issue sessions only after independent identity verification.
 */
import {randomBytes,createHash,timingSafeEqual} from "node:crypto";
const digest=token=>createHash("sha256").update(token).digest();
export function createSessionStore({now=()=>Date.now(),ttlMs=15*60*1000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<=0)throw new TypeError("invalid ttl");
 const records=new Map();
 function issue(verifiedSubject){
  if(typeof verifiedSubject!=="string"||!/^[a-zA-Z0-9_-]{1,128}$/.test(verifiedSubject))throw new TypeError("invalid subject");
  const token=randomBytes(32).toString("base64url");
  const hash=digest(token).toString("hex");
  records.set(hash,{subject:verifiedSubject,expiresAt:now()+ttlMs});
  return {token,expiresAt:records.get(hash).expiresAt};
 }
 function resolve(token){
  if(typeof token!=="string"||! /^[a-zA-Z0-9_-]{43}$/.test(token))return null;
  const incoming=digest(token);
  for(const [hash,record] of records){
   if(timingSafeEqual(incoming,Buffer.from(hash,"hex"))){
    if(record.expiresAt<=now()){records.delete(hash);return null;}
    return {subject:record.subject,verified:true};
   }
  }
  return null;
 }
 function revoke(token){
  if(typeof token!=="string")return false;
  const hash=digest(token).toString("hex");
  return records.delete(hash);
 }
 return {issue,resolve,revoke};
}
