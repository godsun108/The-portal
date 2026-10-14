/* Local test-only passkey registration HTTP adapter.
 * Do not expose beyond loopback or deploy: trusted test sessions and account
 * lookup are injected, and account onboarding remains unimplemented.
 */
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readSessionCookie} from "./session-cookie.mjs";
import {createRequestGuard} from "./request-guard.mjs";
import {createBrowserCeremonyService} from "./browser-ceremony-service.mjs";
const validID=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{1,128}$/.test(s);
const validHandle=s=>typeof s==="string"&&/^[A-Za-z0-9_-]{43}$/.test(s);
const hash=s=>createHash("sha256").update(s).digest("hex");
export function createLoopbackRegistrationAPI({
 sessions,accountLookup,challengeStore,credentialRegistry,sessionStore,origin,rpID,now=()=>Date.now()
}){
 if(typeof sessions?.resolve!=="function"||typeof accountLookup!=="function")
  throw new TypeError("missing trusted session/account lookup");
 const guard=createRequestGuard({trustedOrigin:origin});
 const ceremonies=createBrowserCeremonyService({
  challengeStore,credentialRegistry,sessionStore,expectedOrigin:origin,rpID,now
 });
 // HTTP request must retain the same trusted session that began registration.
 const pending=new Map();
 const send=(res,status,value)=>{
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8",
   "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  res.end(JSON.stringify(value));
 };
 const server=createServer(async(req,res)=>{
  try{
   if(req.method!=="POST"||!["/register/options","/register/verify"].includes(req.url))
    return send(res,404,{error:"not-found"});
   if(!guard({method:req.method,headers:req.headers}).allowed)
    return send(res,403,{error:"origin-denied"});
   const token=readSessionCookie(req.headers.cookie);
   const actor=token?sessions.resolve(token):null;
   if(actor?.verified!==true||!validID(actor.subject))
    return send(res,401,{error:"authentication-required"});
   let raw="",length=0;
   for await(const part of req){
    length+=part.byteLength;
    if(length>32768)return send(res,413,{error:"payload-too-large"});
    raw+=part.toString("utf8");
   }
   let body;
   try{body=JSON.parse(raw||"{}");}catch{return send(res,400,{error:"invalid-json"});}
   if(!body||typeof body!=="object"||Array.isArray(body))return send(res,400,{error:"invalid-request"});
   if(req.url==="/register/options"){
    const account=await accountLookup(actor.subject);
    if(!account||account.id!==actor.subject||typeof account.userName!=="string")
     return send(res,403,{error:"account-unavailable"});
    const begun=await ceremonies.beginRegistration({
     trustedAccountId:account.id,trustedUserName:account.userName
    });
    pending.set(hash(begun.handle),{subject:actor.subject,sessionHash:hash(token)});
    return send(res,200,begun);
   }
   if(!validHandle(body.handle)||!body.response||typeof body.response!=="object")
    return send(res,400,{error:"invalid-request"});
   const key=hash(body.handle),binding=pending.get(key);
   if(!binding)return send(res,403,{error:"ceremony-denied"});
   // Consume before any verification attempt, including a different session.
   pending.delete(key);
   if(binding.subject!==actor.subject||binding.sessionHash!==hash(token))
    return send(res,403,{error:"ceremony-denied"});
   const result=await ceremonies.finishRegistration({handle:body.handle,response:body.response});
   return send(res,result.registered?200:403,{registered:result.registered===true});
  }catch{return send(res,500,{error:"internal-error"});}
 });
 return {server};
}
