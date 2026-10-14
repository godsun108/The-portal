/* Cookie transport helpers for a future trusted HTTPS backend.
 * Pure header formatting/parsing only; NOT a deployed auth endpoint.
 * Cookie-authenticated state changes also need CSRF + Origin enforcement.
 */
export const SESSION_COOKIE_NAME="__Host-earthid";
const tokenPattern=/^[A-Za-z0-9_-]{43}$/;
export function createSessionCookie({token,maxAgeSeconds=900}){
 if(typeof token!=="string"||!tokenPattern.test(token))throw new TypeError("invalid session token");
 if(!Number.isSafeInteger(maxAgeSeconds)||maxAgeSeconds<1||maxAgeSeconds>86400)
  throw new TypeError("invalid cookie lifetime");
 return SESSION_COOKIE_NAME+"="+token+"; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age="+maxAgeSeconds;
}
export function clearSessionCookie(){
 return SESSION_COOKIE_NAME+"=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0";
}
export function readSessionCookie(header){
 if(typeof header!=="string"||header.length>8192)return null;
 let found=null;
 for(const part of header.split(";")){
  const piece=part.trim(),eq=piece.indexOf("=");
  if(eq<0)continue;
  if(piece.slice(0,eq).trim()!==SESSION_COOKIE_NAME)continue;
  const candidate=piece.slice(eq+1);
  if(!tokenPattern.test(candidate)||found!==null)return null;
  found=candidate;
 }
 return found;
}
