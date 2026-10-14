/* Local-only server-side ceremony binding; never expose issue() directly to
 * untrusted clients. A verified/onboarding server process selects the account.
 * Does not provide production durable sessions or real account onboarding.
 */
import {randomBytes,createHash,timingSafeEqual} from "node:crypto";
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validToken=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const hash=s=>createHash("sha256").update(s).digest("hex");
export function createCeremonyBindingStore({now=()=>Date.now(),ttlMs=120000}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<=0)throw new TypeError("invalid ttl");
 const pending=new Map();
 return {
  issue({trustedAccountId,ceremony,challenge}){
   if(!validId(trustedAccountId)||!["registration","authentication"].includes(ceremony)||!validToken(challenge))
    throw new TypeError("invalid trusted ceremony input");
   const handle=randomBytes(32).toString("base64url");
   pending.set(hash(handle),{accountId:trustedAccountId,ceremony,challengeHash:hash(challenge),expiresAt:now()+ttlMs});
   return handle;
  },
  consume({handle,challenge,ceremony}){
   if(!validToken(handle)||!validToken(challenge)||!["registration","authentication"].includes(ceremony))return null;
   const key=hash(handle),record=pending.get(key);
   if(!record)return null;
   pending.delete(key); // one attempt, including mismatches
   const sameChallenge=timingSafeEqual(Buffer.from(record.challengeHash,"hex"),Buffer.from(hash(challenge),"hex"));
   if(record.expiresAt<=now()||record.ceremony!==ceremony||!sameChallenge)return null;
   return {accountId:record.accountId,challenge,ceremony};
  }
 };
}
