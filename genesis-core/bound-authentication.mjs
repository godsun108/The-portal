/* Local-only coordination: caller MUST choose trustedAccountId using server-side
 * identity/onboarding state. Browser requests may only supply handle and response.
 */
import {createAuthenticationFlow} from "./authentication-flow.mjs";
export function createBoundAuthentication({
 challengeStore,ceremonyBindings,credentialRegistry,sessionStore,expectedOrigin,expectedRPID
}){
 if(!challengeStore||typeof challengeStore.issue!=="function"||
    !ceremonyBindings||typeof ceremonyBindings.issue!=="function"||typeof ceremonyBindings.consume!=="function")
  throw new TypeError("missing ceremony stores");
 const authentication=createAuthenticationFlow({
  challengeStore,credentialRegistry,sessionStore,expectedOrigin,expectedRPID
 });
 return {
  beginAuthentication(trustedAccountId){
   const challenge=challengeStore.issue({accountId:trustedAccountId,ceremony:"authentication"});
   const handle=ceremonyBindings.issue({
    trustedAccountId,ceremony:"authentication",challenge
   });
   return {handle,challenge};
  },
  async completeAuthentication({handle,challenge,response}){
   const bound=ceremonyBindings.consume({handle,challenge,ceremony:"authentication"});
   if(!bound)return {authenticated:false};
   return authentication.completeAuthentication({
    accountId:bound.accountId,challenge:bound.challenge,response
   });
  }
 };
}
