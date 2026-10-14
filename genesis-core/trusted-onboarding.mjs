/* Local-only operator-approved bootstrap; NOT anonymous account signup.
 * Only a trusted server/operator may call issueInvitation().
 * Redemption does not issue an authenticated session.
 */
import {randomBytes,createHash} from "node:crypto";
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validToken=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const hash=s=>createHash("sha256").update(s).digest("hex");
export function createTrustedOnboarding({credentialRegistry,now=()=>Date.now(),ttlMs=10*60*1000}={}){
 if(typeof credentialRegistry?.addAccount!=="function")throw new TypeError("missing trusted account registry");
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1||ttlMs>86400000)throw new TypeError("invalid invitation lifetime");
 const invitations=new Map();
 return {
  // Trusted operator path ONLY: never wire to a public client-controlled route.
  issueInvitation({approvedAccountId}){
   if(!validId(approvedAccountId))throw new TypeError("invalid approved account");
   const secret=randomBytes(32).toString("base64url");
   invitations.set(hash(secret),{approvedAccountId,expiresAt:now()+ttlMs});
   return secret;
  },
  redeemInvitation({secret}={}){
   if(!validToken(secret))return {provisioned:false};
   const key=hash(secret),record=invitations.get(key);
   if(!record)return {provisioned:false};
   invitations.delete(key); // one attempt, including expiry/duplicate account failure
   if(record.expiresAt<=now())return {provisioned:false};
   if(credentialRegistry.addAccount(record.approvedAccountId)!==true)return {provisioned:false};
   return {provisioned:true,accountId:record.approvedAccountId};
  }
 };
}
