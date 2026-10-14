/* Local-only first enrollment coordinator.
 * approveAccount() is a TRUSTED INTERNAL operator-only call after independent
 * recipient identity verification; NEVER expose it as a public HTTP endpoint.
 * Enrollment grants confer no login/session by themselves.
 */
import {randomBytes,createHash} from "node:crypto";
import {createBrowserCeremonyService} from "./browser-ceremony-service.mjs";
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validToken=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const digest=s=>createHash("sha256").update(s).digest("hex");
export function createAuthorizedFirstEnrollment({
 credentialRegistry,challengeStore,sessionStore,expectedOrigin,rpID,
 trustedAccountLookup,now=()=>Date.now(),ttlMs=120000
}){
 if(typeof trustedAccountLookup!=="function")throw new TypeError("trusted account lookup required");
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||ttlMs>300000)throw new TypeError("invalid grant lifetime");
 const ceremonies=createBrowserCeremonyService({
  credentialRegistry,challengeStore,sessionStore,expectedOrigin,rpID,now,ttlMs
 });
 const grants=new Map();
 return {
  // Operator-only entry. The caller MUST verify the recipient's identity
  // independently. Having an invitation string is not sufficient.
  approveAccount({trustedAccountId}){
   if(!validId(trustedAccountId))throw new TypeError("invalid trusted account");
   const grant=randomBytes(32).toString("base64url");
   grants.set(digest(grant),{accountId:trustedAccountId,expiresAt:now()+ttlMs});
   return grant;
  },
  async beginEnrollment({grant}={}){
   if(!validToken(grant))return null;
   const key=digest(grant),record=grants.get(key);
   if(!record)return null;
   grants.delete(key); // one shot even on rejected/expired lookup
   if(record.expiresAt<=now())return null;
   const account=await trustedAccountLookup(record.accountId);
   if(!account||account.id!==record.accountId||typeof account.userName!=="string")return null;
   return ceremonies.beginRegistration({trustedAccountId:account.id,trustedUserName:account.userName});
  },
  async finishEnrollment({handle,response}){
   return ceremonies.finishRegistration({handle,response});
  }
 };
}
