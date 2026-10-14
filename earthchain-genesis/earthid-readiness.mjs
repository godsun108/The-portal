/* Read-only browser readiness checks. No WebAuthn prompts, requests or login. */
export function inspectEarthIDBrowser(platform={}) {
 const secureContext=platform.isSecureContext===true;
 const publicKey=platform.PublicKeyCredential;
 const nativeWebAuthn=typeof platform.navigator?.credentials?.create==="function" &&
  typeof platform.navigator?.credentials?.get==="function" &&
  typeof publicKey==="function";
 const jsonParsing=typeof publicKey?.parseCreationOptionsFromJSON==="function" &&
  typeof publicKey?.parseRequestOptionsFromJSON==="function";
 return {
  secureContext,
  nativeWebAuthn,
  jsonParsing,
  readyForFutureDeviceTest:secureContext&&nativeWebAuthn&&jsonParsing,
  backendConnected:false,
  signInAvailable:false
 };
}
