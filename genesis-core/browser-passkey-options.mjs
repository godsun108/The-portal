/* Local-only browser WebAuthn options generator.
 * The server MUST select accountId and userName from trusted account state.
 * No HTTP endpoint, browser session, or account bootstrap is included.
 */
import {createHash} from "node:crypto";
import {generateRegistrationOptions,generateAuthenticationOptions} from "@simplewebauthn/server";
const validID=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validChallenge=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const validCredential=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,1024}$/.test(s);
export function createBrowserPasskeyOptions({challengeStore,rpID,rpName="EarthID"}){
 if(!challengeStore||typeof challengeStore.issue!=="function")throw new TypeError("missing challenge store");
 if(typeof rpID!=="string"||!/^[a-z0-9.-]+$/.test(rpID)||typeof rpName!=="string"||!rpName.trim())throw new TypeError("invalid RP configuration");
 function challenge(accountId,ceremony){
  if(!validID(accountId))throw new TypeError("invalid trusted account");
  const value=challengeStore.issue({accountId,ceremony});
  if(!validChallenge(value))throw new TypeError("invalid issued challenge");
  return Buffer.from(value,"base64url");
 }
 return {
  async registration({trustedAccountId,trustedUserName,excludeCredentialIds=[]}){
   if(!validID(trustedAccountId)||typeof trustedUserName!=="string"||!trustedUserName.trim()||trustedUserName.length>128||
      !Array.isArray(excludeCredentialIds)||excludeCredentialIds.length>50||!excludeCredentialIds.every(validCredential))
    throw new TypeError("invalid trusted registration context");
   // Stable opaque 32-byte user handle; do not embed user email or name.
   const userID=createHash("sha256").update("EarthID-user-v1:").update(trustedAccountId).digest();
   return generateRegistrationOptions({
    rpID,rpName,userID,userName:trustedUserName,
    challenge:challenge(trustedAccountId,"registration"),
    attestationType:"none",supportedAlgorithmIDs:[-7],
    excludeCredentials:excludeCredentialIds.map(id=>({id})),
    authenticatorSelection:{residentKey:"required",userVerification:"required"},
    timeout:120000
   });
  },
  async authentication({trustedAccountId,allowCredentialIds=[]}){
   if(!validID(trustedAccountId)||!Array.isArray(allowCredentialIds)||allowCredentialIds.length>50||
      !allowCredentialIds.every(validCredential))throw new TypeError("invalid trusted authentication context");
   return generateAuthenticationOptions({
    rpID,challenge:challenge(trustedAccountId,"authentication"),
    allowCredentials:allowCredentialIds.map(id=>({id})),
    userVerification:"required",timeout:120000
   });
  }
 };
}
