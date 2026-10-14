import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createSessionStore} from "./sessions.mjs";
import {createLocalEarthIDService} from "./local-http-service.mjs";
test("loopback HTTP: verified test sessions isolate private notes and enforce mutation origin",async()=>{
 const sessions=createSessionStore();
 // Trusted test fixture: issuance is internal, NEVER an unauthenticated HTTP route.
 const alice=sessions.issue("alice").token,bob=sessions.issue("bob").token;
 const {server,closeDatabase}=createLocalEarthIDService({sessions,trustedOrigin:"https://id.example.org"});
 server.listen(0,"127.0.0.1");
 await once(server,"listening");
 const base="http://127.0.0.1:"+server.address().port;
 const send=(method,path,token,origin,body)=>fetch(base+path,{
  method,headers:{...(token?{Cookie:"__Host-earthid="+token}:{}),...(origin?{Origin:origin}:{}),
   ...(body?{"Content-Type":"application/json"}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 try{
  const note={id:"alice_note",body:"ALICE_PRIVATE_TEST_CONTENT"};
  assert.equal((await send("POST","/notes",alice,"https://attacker.example",note)).status,403);
  assert.equal((await send("POST","/notes",alice,null,note)).status,403);
  assert.equal((await send("POST","/notes",alice,"https://id.example.org",note)).status,201);
  const own=await send("GET","/notes/alice_note",alice);
  assert.equal(own.status,200);assert.equal((await own.json()).body,note.body);
  const other=await send("GET","/notes/alice_note",bob);
  assert.equal(other.status,403);assert.equal((await other.text()).includes(note.body),false);
  const anonymous=await send("GET","/notes/alice_note",null);
  assert.equal(anonymous.status,401);assert.equal((await anonymous.text()).includes(note.body),false);
  sessions.revoke(alice);
  assert.equal((await send("GET","/notes/alice_note",alice)).status,401);
 }finally{
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  closeDatabase();
 }
});
