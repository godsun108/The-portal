/* Local-only enrollment orchestration. Account identity MUST originate from
 * trusted server-controlled onboarding state, never untrusted request JSON.
 * No public endpoint or production-ready account bootstrap.
 */
import {createWebAuthnBoundary} from "./webauthn-boundary.mjs";
import {verifyEarthIDRegistration,verifyEarthIDAuthentication} from "./simplewebauthn-verifier.mjs";
export function createEnrollmentFlow({challengeStore,credentialRegistry,expectedOrigin,expectedRPID}){
 if(!credentialRegistry||typeof credentialRegistry.addVerifiedWebAuthnCredential!=="function")
  throw new TypeError("missing trusted credential registry");
 const boundary=createWebAuthnBoundary({challengeStore,verifyRegistration:verifyEarthIDRegistration,
  verifyAuthentication:verifyEarthIDAuthentication,expectedOrigin,expectedRPID});
 return {
  async completeRegistration({accountId,challenge,response}){
   // Assumes accountId and challenge are retrieved from trusted server state.
   const verification=await boundary.complete({accountId,ceremony:"registration",challenge,response});
   if(verification.verified!==true)return {registered:false};
   const credential=verification.verificationInfo?.credential;
   if(!credential||typeof credential.id!=="string"||credential.id!==response.id||
      !(credential.publicKey instanceof Uint8Array)||
      !Number.isSafeInteger(credential.counter)||credential.counter<0)
     return {registered:false};
   const saved=credentialRegistry.addVerifiedWebAuthnCredential({
    id:credential.id,accountId,publicKey:credential.publicKey,counter:credential.counter
   });
   return {registered:saved===true};
  }
 };
}
