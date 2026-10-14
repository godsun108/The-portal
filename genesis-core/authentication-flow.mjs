/* EarthID local-only authentication flow. No HTTP endpoint, no enrollment,
 * no real-account bootstrap, and no production-ready session transport.
 * The accountId MUST come from trusted, server-controlled ceremony state.
 */
import {createWebAuthnBoundary} from "./webauthn-boundary.mjs";
import {verifyEarthIDRegistration,verifyEarthIDAuthentication} from "./simplewebauthn-verifier.mjs";

export function createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,expectedOrigin,expectedRPID}){
 if(!credentialRegistry||typeof credentialRegistry.getWebAuthnCredential!=="function"||
    typeof credentialRegistry.commitVerifiedCounter!=="function"||
    !sessionStore||typeof sessionStore.issue!=="function")throw new TypeError("missing trusted stores");
 const boundary=createWebAuthnBoundary({
  challengeStore,verifyRegistration:verifyEarthIDRegistration,
  verifyAuthentication:verifyEarthIDAuthentication,expectedOrigin,expectedRPID
 });
 async function completeAuthentication({accountId,challenge,response}){
  // accountId must be supplied by trusted server state, NEVER request JSON.
  const credentialId=response?.id;
  const credential=typeof credentialId==="string"
   ?credentialRegistry.getWebAuthnCredential(credentialId,accountId):null;
  const result=await boundary.complete({
   accountId,ceremony:"authentication",challenge,response,credential
  });
  if(result.verified!==true)return {authenticated:false};
  const next=result.verificationInfo?.newCounter;
  if(!Number.isSafeInteger(next)||next<0)return {authenticated:false};
  const stored=credentialRegistry.commitVerifiedCounter({
   id:credential.id,accountId,previousCounter:credential.counter,newCounter:next
  });
  if(stored!==true)return {authenticated:false};
  const session=sessionStore.issue(accountId);
  return {authenticated:true,session};
 }
 return {completeAuthentication};
}
