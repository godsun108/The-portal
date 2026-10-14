/* Local-only HTTP request policy for future cookie-authenticated routes.
 * Not an HTTP server, CSRF token service or production security boundary.
 */
const MUTATIONS=new Set(["POST","PUT","PATCH","DELETE"]);
const SAFE=new Set(["GET","HEAD","OPTIONS"]);
export function createRequestGuard({trustedOrigin}={}){
 let origin;
 try { origin=new URL(trustedOrigin); }catch{ throw new TypeError("invalid trusted origin"); }
 if(origin.protocol!=="https:"||origin.username||origin.password||origin.pathname!=="/"||
    origin.search||origin.hash||trustedOrigin!==origin.origin)
  throw new TypeError("expected exact HTTPS origin");
 return function check({method,headers}={}){
  if(typeof method!=="string"||!headers||typeof headers!=="object")return {allowed:false,reason:"invalid-request"};
  const verb=method.toUpperCase();
  if(!MUTATIONS.has(verb)&&!SAFE.has(verb))return {allowed:false,reason:"unsupported-method"};
  const fetchSite=headers["sec-fetch-site"];
  if(typeof fetchSite==="string"&&!["same-origin","none"].includes(fetchSite))
   return {allowed:false,reason:"cross-site-request"};
  if(SAFE.has(verb))return {allowed:true,reason:"safe-method"};
  const supplied=headers.origin;
  if(typeof supplied!=="string")return {allowed:false,reason:"missing-origin"};
  // Exact string equality rejects spoofed subdomains, origin-prefix tricks,
  // malformed origins, non-HTTPS schemes, and altered ports.
  if(supplied!==origin.origin)return {allowed:false,reason:"origin-mismatch"};
  return {allowed:true,reason:"same-origin-mutation"};
 };
}
