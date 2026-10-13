/* Local-only WebAuthn ceremony challenge tracker. NOT a WebAuthn verifier.
 * Caller must bind trusted session/account and verify WebAuthn responses separately.
 */
import {randomBytes,createHash,timingSafeEqual} from "node:crypto";
const digest=s=>createHash("sha256").update(s).digest();
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
export function createChallengeStore({now=()=>Date.now(),ttlMs=120000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<=0)throw new TypeError("invalid ttl");
 const pending=new Map();
 function issue({accountId,ceremony}){
  if(!validId(accountId)||!["registration","authentication"].includes(ceremony))throw new TypeError("invalid challenge context");
  const challenge=randomBytes(32).toString("base64url");
  pending.set(digest(challenge).toString("hex"),{accountId,ceremony,expiresAt:now()+ttlMs});
  return challenge;
 }
 function consume({challenge,accountId,ceremony}){
  if(typeof challenge!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(challenge)||!validId(accountId)||!["registration","authentication"].includes(ceremony))return false;
  const incoming=digest(challenge);
  for(const [hash,record] of pending){
   if(timingSafeEqual(incoming,Buffer.from(hash,"hex"))){
    pending.delete(hash); // consume even on wrong context, preventing repeated guessing
    return record.expiresAt>now()&&record.accountId===accountId&&record.ceremony===ceremony;
   }
  }
  return false;
 }
 return {issue,consume};
}
