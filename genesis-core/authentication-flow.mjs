/* EarthID local-only authentication flow. No HTTP endpoint, no enrollment,
 * no real-account bootstrap, and no production-ready session transport.
 * accountId MUST come from trusted, server-controlled ceremony state.
 */
import {createWebAuthnBoundary} from "./webauthn-boundary.mjs";
import {verifyEarthIDRegistration,verifyEarthIDAuthentication} from "./simplewebauthn-verifier.mjs";
const validDeviceId=value=>typeof value==="string"&&/^[A-Za-z0-9_-]{32}$/.test(value);
export function createAuthenticationFlow({challengeStore,credentialRegistry,sessionStore,deviceInventory=null,expectedOrigin,expectedRPID}){
 if(!credentialRegistry||typeof credentialRegistry.getWebAuthnCredential!=="function"||
    typeof credentialRegistry.commitVerifiedCounter!=="function"||
    !sessionStore||typeof sessionStore.issue!=="function")throw new TypeError("missing trusted stores");
 if(deviceInventory&&(!["enroll","touch"].every(name=>typeof deviceInventory[name]==="function")))
  throw new TypeError("invalid device inventory");
 const boundary=createWebAuthnBoundary({challengeStore,verifyRegistration:verifyEarthIDRegistration,
  verifyAuthentication:verifyEarthIDAuthentication,expectedOrigin,expectedRPID});
 async function completeAuthentication({accountId,challenge,response,device=null}){
  // accountId is trusted ceremony state. Device metadata is not trusted until
  // the passkey assertion succeeds; a client-supplied ID is only a lookup hint.
  const credentialId=response?.id;
  const credential=typeof credentialId==="string"
   ?credentialRegistry.getWebAuthnCredential(credentialId,accountId):null;
  const result=await boundary.complete({accountId,ceremony:"authentication",challenge,response,credential});
  if(result.verified!==true)return {authenticated:false};
  const next=result.verificationInfo?.newCounter;
  if(!Number.isSafeInteger(next)||next<0)return {authenticated:false};
  const stored=credentialRegistry.commitVerifiedCounter({
   id:credential.id,accountId,previousCounter:credential.counter,newCounter:next
  });
  if(stored!==true)return {authenticated:false};
  let deviceRecord=null;
  if(deviceInventory){
   if(!device||typeof device.label!=="string"||typeof device.platform!=="string")
    return {authenticated:false};
   // Existing device IDs are merely account-scoped metadata hints. They confer
   // no access: the passkey assertion above is the authentication proof.
   const reused=validDeviceId(device.deviceId)&&deviceInventory.touch(accountId,device.deviceId);
   deviceRecord=reused
    ?deviceInventory.list(accountId).find(item=>item.deviceId===device.deviceId)??null
    :deviceInventory.enroll(accountId,{label:device.label,platform:device.platform});
   if(!deviceRecord?.active)return {authenticated:false};
  }
  const session=deviceRecord
   ?sessionStore.issue(accountId,{deviceId:deviceRecord.deviceId})
   :sessionStore.issue(accountId);
  return {authenticated:true,session,...(deviceRecord?{device:deviceRecord}:{})};
 }
 return {completeAuthentication};
}
