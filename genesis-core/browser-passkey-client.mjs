/* EarthID WebAuthn browser transport adapter, NOT a standalone login UI.
 * begin/finish functions MUST come from a trusted same-origin HTTPS service.
 * No client-asserted login successes are accepted.
 */
export function createBrowserPasskeyClient({platform,beginRegistration,finishRegistration,beginAuthentication,finishAuthentication}){
 const usable=typeof platform?.PublicKeyCredential?.parseCreationOptionsFromJSON==="function"&&
  typeof platform?.PublicKeyCredential?.parseRequestOptionsFromJSON==="function"&&
  typeof platform?.navigator?.credentials?.create==="function"&&
  typeof platform?.navigator?.credentials?.get==="function";
 const available=()=>Boolean(usable&&platform?.isSecureContext===true);
 const trusted=fn=>typeof fn==="function";
 function ensure(condition){if(!condition)throw new Error("EarthID passkey flow unavailable");}
 async function register(){
  ensure(available()&&trusted(beginRegistration)&&trusted(finishRegistration));
  // Server must bind the ceremony to an already-trusted account.
  const begin=await beginRegistration();
  ensure(typeof begin?.handle==="string"&&begin.handle.length>0&&begin?.options&&typeof begin.options==="object");
  const options=platform.PublicKeyCredential.parseCreationOptionsFromJSON(begin.options);
  const credential=await platform.navigator.credentials.create({publicKey:options});
  ensure(credential&&typeof credential.toJSON==="function");
  // Raw browser credential is not proof of registration until verified server-side.
  const finish=await finishRegistration({handle:begin.handle,response:credential.toJSON()});
  if(finish?.registered!==true)throw new Error("EarthID registration not verified");
  return {registered:true};
 }
 async function authenticate(){
  ensure(available()&&trusted(beginAuthentication)&&trusted(finishAuthentication));
  const begin=await beginAuthentication();
  ensure(typeof begin?.handle==="string"&&begin.handle.length>0&&begin?.options&&typeof begin.options==="object");
  const options=platform.PublicKeyCredential.parseRequestOptionsFromJSON(begin.options);
  const credential=await platform.navigator.credentials.get({publicKey:options});
  ensure(credential&&typeof credential.toJSON==="function");
  const finish=await finishAuthentication({handle:begin.handle,response:credential.toJSON()});
  if(finish?.authenticated!==true)throw new Error("EarthID login not verified");
  // Authentication token stays in the server's secure HttpOnly cookie.
  return {authenticated:true};
 }
 return {available,register,authenticate};
}
