/* Local-only EarthID browser ceremony coordinator, not a public API.
 * beginRegistration/beginAuthentication require server-verified account identity.
 * finish calls accept only a one-time opaque handle and browser response.
 */
import {randomBytes,createHash} from "node:crypto";
import {createBrowserPasskeyOptions} from "./browser-passkey-options.mjs";
import {createEnrollmentFlow} from "./enrollment-flow.mjs";
import {createAuthenticationFlow} from "./authentication-flow.mjs";
const validHandle=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const digest=s=>createHash("sha256").update(s).digest("hex");
const MAX_PENDING_CEREMONIES=256;
export function createBrowserCeremonyService({challengeStore,credentialRegistry,sessionStore,expectedOrigin,rpID,rpName="EarthID",now=()=>Date.now(),ttlMs=120000}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<=0||ttlMs>300000)throw new TypeError("invalid ceremony TTL");
 const options=createBrowserPasskeyOptions({challengeStore,rpID,rpName});
 const registration=createEnrollmentFlow({challengeStore,credentialRegistry,expectedOrigin,expectedRPID:rpID});
 const authentication=createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,expectedOrigin,expectedRPID:rpID});
 const pending=new Map();
 function pruneExpired(){
  const time=now();
  for(const [key,record] of pending)if(record.expiresAt<=time)pending.delete(key);
 }
 function save(accountId,ceremony,challenge){
  pruneExpired();
  if(pending.size>=MAX_PENDING_CEREMONIES){
   const error=new Error("too many pending WebAuthn ceremonies");
   error.code="CEREMONY_CAPACITY";
   throw error;
  }
  const handle=randomBytes(32).toString("base64url");
  pending.set(digest(handle),{accountId,ceremony,challenge,expiresAt:now()+ttlMs});
  return handle;
 }
 function take(handle,ceremony){
  if(!validHandle(handle))return null;
  const key=digest(handle),record=pending.get(key);
  if(!record)return null;
  pending.delete(key);
  if(record.expiresAt<=now()||record.ceremony!==ceremony)return null;
  return record;
 }
 return {
  async beginRegistration({trustedAccountId,trustedUserName,excludeCredentialIds=[]}){
   const opts=await options.registration({trustedAccountId,trustedUserName,excludeCredentialIds});
   return {handle:save(trustedAccountId,"registration",opts.challenge),options:opts};
  },
  async finishRegistration({handle,response}){
   const record=take(handle,"registration");
   if(!record)return {registered:false};
   return registration.completeRegistration({accountId:record.accountId,challenge:record.challenge,response});
  },
  async beginAuthentication({trustedAccountId,allowCredentialIds=[]}){
   const opts=await options.authentication({trustedAccountId,allowCredentialIds});
   return {handle:save(trustedAccountId,"authentication",opts.challenge),options:opts};
  },
  async finishAuthentication({handle,response}){
   const record=take(handle,"authentication");
   if(!record)return {authenticated:false};
   return authentication.completeAuthentication({accountId:record.accountId,challenge:record.challenge,response});
  }
 };
}
