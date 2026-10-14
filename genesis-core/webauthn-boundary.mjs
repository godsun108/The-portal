/* Test-only WebAuthn ceremony orchestration boundary.
 * A production caller MUST inject vetted WebAuthn cryptographic verification.
 * This module MUST NOT be exposed as a public authentication endpoint.
 */
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validChallenge=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
export function createWebAuthnBoundary({challengeStore,verifyRegistration,verifyAuthentication,expectedOrigin,expectedRPID}){
 if(!challengeStore||typeof challengeStore.consume!=="function"||typeof verifyRegistration!=="function"||typeof verifyAuthentication!=="function")throw new TypeError("missing trusted verifier dependencies");
 if(typeof expectedOrigin!=="string"||!/^https:\/\//.test(expectedOrigin)||typeof expectedRPID!=="string"||!/^[a-z0-9.-]+$/.test(expectedRPID))throw new TypeError("invalid relying-party configuration");
 async function complete({accountId,ceremony,challenge,response,credential}){
  if(!validId(accountId)||!["registration","authentication"].includes(ceremony)||!validChallenge(challenge)||!response||typeof response!=="object")return {verified:false,reason:"invalid-request"};
  // Consume before verification so retry or failed signature attempts cannot reuse a challenge.
  if(!challengeStore.consume({accountId,ceremony,challenge}))return {verified:false,reason:"invalid-or-expired-challenge"};
  if(ceremony==="authentication"&&(!credential||credential.accountId!==accountId||credential.revoked===true||credential.id!==response.id))return {verified:false,reason:"credential-not-authorized"};
  try{
   const verify=ceremony==="registration"?verifyRegistration:verifyAuthentication;
   const input={response,expectedChallenge:challenge,expectedOrigin,expectedRPID,requireUserVerification:true};
   if(ceremony==="authentication")input.credential=credential;
   const result=await verify(input);
   if(result?.verified!==true)return {verified:false,reason:"verification-failed"};
   return {verified:true,reason:"verified-by-injected-verifier",verificationInfo:ceremony==="registration"?result.registrationInfo:result.authenticationInfo};
  }catch{return {verified:false,reason:"verification-failed"};}
 }
 return {complete};
}
