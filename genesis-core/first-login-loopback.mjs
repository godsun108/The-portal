/* LOCAL TEST FIXTURE ONLY. This is NOT a production login server.
 * accountHint is an untrusted locator, never proof of account ownership.
 * The real WebAuthn signature alone authorizes session issuance.
 */
import {createServer} from "node:http";
import {createBrowserCeremonyService} from "./browser-ceremony-service.mjs";
import {createRequestGuard} from "./request-guard.mjs";
import {createSessionCookie} from "./session-cookie.mjs";
const validId=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validHandle=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
export function createFirstLoginLoopbackAPI({
 resolveAccountHint,challengeStore,credentialRegistry,sessionStore,origin,rpID
}){
 if(typeof resolveAccountHint!=="function"||typeof sessionStore?.issue!=="function")
  throw new TypeError("missing trusted account resolver or session store");
 const guard=createRequestGuard({trustedOrigin:origin});
 const ceremonies=createBrowserCeremonyService({
  challengeStore,credentialRegistry,sessionStore,expectedOrigin:origin,rpID
 });
 const send=(res,status,payload,headers={})=>{
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8",
   "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers});
  res.end(JSON.stringify(payload));
 };
 const server=createServer(async(req,res)=>{
  try{
   if(req.method!=="POST"||!["/login/options","/login/verify"].includes(req.url))
    return send(res,404,{error:"not-found"});
   if(!guard({method:req.method,headers:req.headers}).allowed)
    return send(res,403,{error:"request-denied"});
   let body="",length=0;
   for await(const chunk of req){
    length+=chunk.length;
    if(length>32768)return send(res,413,{error:"payload-too-large"});
    body+=chunk.toString("utf8");
   }
   let data;
   try{data=JSON.parse(body);}catch{return send(res,400,{error:"invalid-json"});}
   if(!data||typeof data!=="object"||Array.isArray(data))return send(res,400,{error:"invalid-request"});
   if(req.url==="/login/options"){
    if(!validId(data.accountHint))return send(res,400,{error:"invalid-request"});
    // The hint is only a locator. Server checks account/credential enrollment.
    const resolved=await resolveAccountHint(data.accountHint);
    if(!resolved||!validId(resolved.id)||resolved.id!==data.accountHint||
       !Array.isArray(resolved.credentialIds)||resolved.credentialIds.length===0)
     return send(res,403,{error:"login-unavailable"});
    const begun=await ceremonies.beginAuthentication({
     trustedAccountId:resolved.id,allowCredentialIds:resolved.credentialIds
    });
    return send(res,200,begun);
   }
   if(!validHandle(data.handle)||!data.response||typeof data.response!=="object")
    return send(res,400,{error:"invalid-request"});
   // One-time handle resolves a server-selected account. Never use accountHint here.
   const result=await ceremonies.finishAuthentication({handle:data.handle,response:data.response});
   if(result.authenticated!==true||typeof result.session?.token!=="string")
    return send(res,403,{authenticated:false});
   // A real HTTPS deployment must actually provide TLS and secure cookie handling.
   const maxAge=Math.max(1,Math.min(900,Math.floor((result.session.expiresAt-Date.now())/1000)));
   return send(res,200,{authenticated:true},{"Set-Cookie":createSessionCookie({token:result.session.token,maxAgeSeconds:maxAge})});
  }catch{return send(res,500,{error:"internal-error"});}
 });
 return {server};
}
