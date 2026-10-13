import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createIsolationServer} from "./http-isolation.mjs";
test("HTTP isolation: owner allowed, stranger forbidden without leaking bytes",async()=>{
 const server=createIsolationServer();server.listen(0,"127.0.0.1");await once(server,"listening");
 try{
  const base="http://127.0.0.1:"+server.address().port;
  const get=(path,token)=>fetch(base+path,{headers:token?{Authorization:"Bearer "+token}:{}}); 
  const own=await get("/posts/alice-private","fixture-token-alice");
  assert.equal(own.status,200);assert.equal((await own.json()).body,"ALICE_PRIVATE_SENTINEL");
  const stranger=await get("/posts/alice-private","fixture-token-bob");
  assert.equal(stranger.status,403);const forbidden=await stranger.text();
  assert.equal(forbidden.includes("ALICE_PRIVATE_SENTINEL"),false);
  const anon=await get("/posts/alice-private");
  assert.equal(anon.status,401);assert.equal((await anon.text()).includes("ALICE_PRIVATE_SENTINEL"),false);
  const publicRead=await get("/posts/alice-public","fixture-token-bob");
  assert.equal(publicRead.status,200);
  const forged=await get("/posts/alice-private","wrong-token");
  assert.equal(forged.status,401);
  const mutation=await fetch(base+"/posts/alice-private",{method:"POST",headers:{Authorization:"Bearer fixture-token-alice"}});
  assert.equal(mutation.status,405);
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
