import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createIsolationServer} from "./http-isolation.mjs";
test("HTTP isolation: private-public-private transition enforces owner and read access",async()=>{
 const server=createIsolationServer();server.listen(0,"127.0.0.1");await once(server,"listening");
 try{
  const base="http://127.0.0.1:"+server.address().port;
  const request=(path,token,options={})=>fetch(base+path,{...options,headers:{...(options.headers||{}),...(token?{Authorization:"Bearer "+token}:{})}});
  const get=(path,token)=>request(path,token);
  const patch=(visibility,token="fixture-token-alice")=>request("/posts/alice-private",token,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({visibility})});
  const own=await get("/posts/alice-private","fixture-token-alice");
  assert.equal(own.status,200);assert.equal((await own.json()).body,"ALICE_PRIVATE_SENTINEL");
  const stranger=await get("/posts/alice-private","fixture-token-bob");
  assert.equal(stranger.status,403);assert.equal((await stranger.text()).includes("ALICE_PRIVATE_SENTINEL"),false);
  const anon=await get("/posts/alice-private");
  assert.equal(anon.status,401);assert.equal((await anon.text()).includes("ALICE_PRIVATE_SENTINEL"),false);
  const publicRead=await get("/posts/alice-public","fixture-token-bob");
  assert.equal(publicRead.status,200);
  assert.equal((await patch("public","fixture-token-bob")).status,403,"stranger cannot publish Alice's post");
  assert.equal((await patch("public","wrong-token")).status,401,"invalid token cannot publish");
  const published=await patch("public");
  assert.equal(published.status,200);assert.equal((await published.json()).visibility,"public");
  const nowPublic=await get("/posts/alice-private","fixture-token-bob");
  assert.equal(nowPublic.status,200);assert.equal((await nowPublic.json()).body,"ALICE_PRIVATE_SENTINEL");
  assert.equal((await patch("not-a-visibility")).status,400);
  const rePrivatized=await patch("private");
  assert.equal(rePrivatized.status,200);assert.equal((await rePrivatized.json()).visibility,"private");
  const deniedAgain=await get("/posts/alice-private","fixture-token-bob");
  assert.equal(deniedAgain.status,403);
  assert.equal((await deniedAgain.text()).includes("ALICE_PRIVATE_SENTINEL"),false);
  const ownerStillReads=await get("/posts/alice-private","fixture-token-alice");
  assert.equal(ownerStillReads.status,200);assert.equal((await ownerStillReads.json()).body,"ALICE_PRIVATE_SENTINEL");
  const forged=await get("/posts/alice-private","wrong-token");
  assert.equal(forged.status,401);
  const mutation=await request("/posts/alice-private","fixture-token-alice",{method:"POST"});
  assert.equal(mutation.status,405);
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
