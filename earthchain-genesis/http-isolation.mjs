/* Local test-only HTTP fixture. NEVER deploy this module as an auth service.
 * Static bearer tokens represent synthetic principals; no real sessions exist.
 */
import {createServer} from "node:http";
import {authorize} from "./permissions.mjs";
const users=new Map([["fixture-token-alice",{id:"alice",authenticated:true}],["fixture-token-bob",{id:"bob",authenticated:true}]]);
const posts=new Map([["alice-private",{id:"alice-private",ownerId:"alice",visibility:"private",body:"ALICE_PRIVATE_SENTINEL"}],["alice-public",{id:"alice-public",ownerId:"alice",visibility:"public",body:"Hello world"}]]);
export function createIsolationServer(){
 return createServer((req,res)=>{
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Content-Type","application/json; charset=utf-8");
  const respond=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
  if(req.method!=="GET")return respond(405,{error:"method-not-allowed"});
  const match=/^\/posts\/([a-z-]+)$/.exec(req.url||"");
  if(!match)return respond(404,{error:"not-found"});
  const header=req.headers.authorization||"";
  const token=header.startsWith("Bearer ")?header.slice(7):"";
  const actor=users.get(token);
  if(!actor)return respond(401,{error:"authentication-required"});
  const post=posts.get(match[1]);
  if(!post)return respond(404,{error:"not-found"});
  const decision=authorize({actor,resource:post,action:"content:read"});
  if(!decision.allowed)return respond(403,{error:"forbidden"});
  return respond(200,{id:post.id,body:post.body});
 });
}
