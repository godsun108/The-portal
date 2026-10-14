/* Integration fixture ONLY: server is not started here, has no login endpoint,
 * and accepts trusted, externally supplied test session and SQLite stores.
 * Never expose outside loopback or treat test-created sessions as login.
 */
import {createServer} from "node:http";
import {DatabaseSync} from "node:sqlite";
import {readSessionCookie} from "./session-cookie.mjs";
import {createRequestGuard} from "./request-guard.mjs";
import {authorize} from "../earthchain-genesis/permissions.mjs";
const validId=value=>typeof value==="string"&&/^[a-zA-Z0-9_-]{1,128}$/.test(value);
const maxBody=4096;
export function createLocalEarthIDService({sessions,trustedOrigin,databasePath=":memory:"}){
 if(typeof sessions?.resolve!=="function")throw new TypeError("missing session store");
 const guard=createRequestGuard({trustedOrigin});
 const db=new DatabaseSync(databasePath);
 db.exec("CREATE TABLE IF NOT EXISTS private_notes(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, body TEXT NOT NULL)");
 const select=db.prepare("SELECT id,owner_id,body FROM private_notes WHERE id=?");
 const insert=db.prepare("INSERT INTO private_notes(id,owner_id,body) VALUES(?,?,?)");
 const reply=(res,status,payload)=>{
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  res.end(JSON.stringify(payload));
 };
 const server=createServer(async(req,res)=>{
  try{
   const url=req.url??"";
   if(!/^\/notes(?:\/[a-zA-Z0-9_-]{1,128})?$/.test(url))return reply(res,404,{error:"not-found"});
   if(req.method!=="GET"&&req.method!=="POST")return reply(res,405,{error:"method-not-allowed"});
   const policy=guard({method:req.method,headers:req.headers});
   if(!policy.allowed)return reply(res,403,{error:"request-denied"});
   const token=readSessionCookie(req.headers.cookie);
   const principal=token?sessions.resolve(token):null;
   if(principal?.verified!==true||!validId(principal.subject))return reply(res,401,{error:"authentication-required"});
   const actor={id:principal.subject,authenticated:true};
   if(req.method==="GET"){
    const id=url.slice("/notes/".length);
    if(!url.startsWith("/notes/")||!validId(id))return reply(res,404,{error:"not-found"});
    const record=select.get(id);
    if(!record)return reply(res,404,{error:"not-found"});
    const resource={id:record.id,ownerId:record.owner_id,visibility:"private"};
    if(!authorize({actor,resource,action:"content:read"}).allowed)return reply(res,403,{error:"forbidden"});
    return reply(res,200,{id:record.id,body:record.body});
   }
   if(url!=="/notes")return reply(res,404,{error:"not-found"});
   let length=0,raw="";
   for await(const chunk of req){
    length+=chunk.length;
    if(length>maxBody)return reply(res,413,{error:"too-large"});
    raw+=chunk.toString("utf8");
   }
   let note;
   try{note=JSON.parse(raw);}catch{return reply(res,400,{error:"invalid-json"});}
   if(!validId(note?.id)||typeof note.body!=="string"||note.body.length>2000)return reply(res,400,{error:"invalid-note"});
   try{insert.run(note.id,actor.id,note.body);}catch{return reply(res,409,{error:"conflict"});}
   return reply(res,201,{id:note.id});
  }catch{return reply(res,500,{error:"internal-error"});}
 });
 return {server,closeDatabase:()=>db.close()};
}
