/* Local test-only HTTP fixture. NEVER deploy this module as an auth service.
 * Static bearer tokens represent synthetic principals; no real sessions exist.
 * The visibility PATCH route exists only to exercise this fixture's request path.
 */
import {createServer} from "node:http";
import {authorize,VISIBILITIES} from "./permissions.mjs";
const users=new Map([["fixture-token-alice",{id:"alice",authenticated:true}],["fixture-token-bob",{id:"bob",authenticated:true}]]);
const posts=new Map([["alice-private",{id:"alice-private",ownerId:"alice",visibility:"private",body:"ALICE_PRIVATE_SENTINEL"}],["alice-public",{id:"alice-public",ownerId:"alice",visibility:"public",body:"Hello world"}]]);
export function createIsolationServer(){
 return createServer(async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Content-Type","application/json; charset=utf-8");
  const respond=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  const match=/^\/posts\/([a-z-]+)$/.exec(req.url||"");
  if(!match)return respond(404,{error:"not-found"});
  const header=req.headers.authorization||"";
  const token=header.startsWith("Bearer ")?header.slice(7):"";
  const actor=users.get(token);
  if(!actor)return respond(401,{error:"authentication-required"});
  const post=posts.get(match[1]);
  if(!post)return respond(404,{error:"not-found"});
  if(req.method==="PATCH"){
   let raw="";
   try{
    for await(const chunk of req){
     raw+=chunk.toString("utf8");
     if(Buffer.byteLength(raw,"utf8")>1024)return respond(413,{error:"payload-too-large"});
    }
   }catch{return respond(400,{error:"invalid-body"});}
   let body;
   try{body=JSON.parse(raw);}catch{return respond(400,{error:"invalid-json"});}
   if(!body||typeof body!=="object"||Array.isArray(body)||!VISIBILITIES.includes(body.visibility))
    return respond(400,{error:"invalid-visibility"});
   const decision=authorize({actor,resource:post,action:"content:edit"});
   if(!decision.allowed)return respond(403,{error:"forbidden"});
   post.visibility=body.visibility;
   return respond(200,{id:post.id,visibility:post.visibility});
  }
  if(req.method!=="GET")return respond(405,{error:"method-not-allowed"});
  const decision=authorize({actor,resource:post,action:"content:read"});
  if(!decision.allowed)return respond(403,{error:"forbidden"});
  return respond(200,{id:post.id,body:post.body});
 });
}
