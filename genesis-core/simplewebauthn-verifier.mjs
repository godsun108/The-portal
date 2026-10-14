/* Real cryptographic verifier adapter for the maintained SimpleWebAuthn library.
 * No endpoint or session issuance. Caller must obtain account-bound trusted
 * credential storage and persist verification counters securely.
 */
import {verifyRegistrationResponse,verifyAuthenticationResponse} from "@simplewebauthn/server";

export async function verifyEarthIDRegistration(input){
 return verifyRegistrationResponse(input);
}

export async function verifyEarthIDAuthentication(input){
 const credential=input?.credential;
 if(!credential||typeof credential!=="object"||credential.revoked===true||
   typeof credential.id!=="string"||!Number.isSafeInteger(credential.counter)||credential.counter<0||
   !(credential.publicKey instanceof Uint8Array)||credential.publicKey.length===0){
  return {verified:false};
 }
 const {revoked,accountId,...key}=credential;
 return verifyAuthenticationResponse({...input,credential:key});
}
