import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createSessionStore} from "./sessions.mjs";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createLoopbackRegistrationAPI} from "./loopback-passkey-registration.mjs";

test("reauth HTTP routes require same session and server-bound purpose",async()=>{
 const sessions=createSessionStore();
 const alice=sessions.issue("alice"),bob=sessions.issue("bob");
 const credentials=createCredentialRegistry();
 credentials.addAccount("alice");credentials.addAccount("bob");
 const {server}=createLoopbackRegistrationAPI({
  sessions,accountLookup:async id=>({id,userName:id}),
  challengeStore:createChallengeStore(),credentialRegistry:credentials,sessionStore:sessions,
  origin:"https://id.example.org",rpID:"id.example.org"
 });
 server.listen(0,"127.0.0.1");await once(server,"listening");
 const base="http://127.0.0.1:"+server.address().port;
 const post=(path,token,origin="https://id.example.org",body={})=>fetch(base+path,{
  method:"POST",headers:{Origin:origin,Cookie:token?"__Host-earthid="+token:"","Content-Type":"application/json"},
  body:JSON.stringify(body)
 });
 try{
  assert.equal((await post("/reauth/options",null)).status,401);
  assert.equal((await post("/reauth/options",alice.token,"https://evil.example")).status,403);
  const response=await post("/reauth/options",alice.token);
  assert.equal(response.status,200);
  const {handle,options}=await response.json();
  assert.equal(options.rpId,"id.example.org");assert.equal(options.challenge.length,43);
  const fake={id:"unknown-credential"};
  assert.equal((await post("/reauth/verify",bob.token,undefined,{handle,response:fake})).status,403);
  assert.equal((await post("/reauth/verify",alice.token,undefined,{handle,response:fake})).status,403);
  const next=await (await post("/reauth/options",alice.token)).json();
  assert.equal((await post("/register/verify",alice.token,undefined,{handle:next.handle,response:fake})).status,403);
  assert.equal((await post("/reauth/verify",alice.token,undefined,{handle:next.handle,response:fake})).status,403);
  const last=await (await post("/reauth/options",alice.token)).json();
  assert.deepEqual(await (await post("/reauth/verify",alice.token,undefined,{handle:last.handle,response:fake})).json(),{authenticated:false});
  sessions.revoke(alice.token);
  assert.equal((await post("/reauth/options",alice.token)).status,401);
 }finally{
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  credentials.close();
 }
});
