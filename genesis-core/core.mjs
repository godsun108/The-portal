/* Genesis Core local-only persistence fixture; never deploy as production auth. */
import {DatabaseSync} from "node:sqlite";
import {authorize} from "../earthchain-genesis/permissions.mjs";
const identities=new Map([["fixture-alice",{id:"alice",authenticated:true}],["fixture-bob",{id:"bob",authenticated:true}]]);
export function createCore(databasePath=":memory:"){
 const db=new DatabaseSync(databasePath);
 db.exec("PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS resources(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, visibility TEXT NOT NULL CHECK(visibility IN ('public','followers','members','private')), body TEXT NOT NULL);");
 const insert=db.prepare("INSERT INTO resources(id,owner_id,visibility,body) VALUES(?,?,?,?)");
 const select=db.prepare("SELECT id,owner_id,visibility,body FROM resources WHERE id=?");
 const create=(token,{id,visibility,body})=>{
  const actor=identities.get(token);
  if(!actor)return {status:401,error:"authentication-required"};
  if(typeof id!=="string"||!/^[a-z0-9_-]{1,128}$/.test(id)||!["public","private","members","followers"].includes(visibility)||typeof body!=="string"||body.length>4096)return {status:400,error:"invalid-resource"};
  try{insert.run(id,actor.id,visibility,body);return {status:201,id};}
  catch{return {status:409,error:"resource-conflict"};}
 };
 const read=(token,id)=>{
  const actor=identities.get(token);
  if(!actor)return {status:401,error:"authentication-required"};
  if(typeof id!=="string")return {status:400,error:"invalid-resource-id"};
  const record=select.get(id);
  if(!record)return {status:404,error:"not-found"};
  const resource={id:record.id,ownerId:record.owner_id,visibility:record.visibility};
  if(!authorize({actor,resource,action:"content:read"}).allowed)return {status:403,error:"forbidden"};
  return {status:200,id:record.id,body:record.body};
 };
 return {create,read,close:()=>db.close()};
}
