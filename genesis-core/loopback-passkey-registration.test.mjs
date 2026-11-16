import test from "node:test";
import assert from "node:assert/strict";
import {once} from "node:events";
import {createSessionStore} from "./sessions.mjs";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createLoopbackRegistrationAPI} from "./loopback-passkey-registration.mjs";
test("loopback registration options bind to session and disallow cross-session verification",async()=>{
 const sessions=createSessionStore(),alice=sessions.issue("alice"),bob=sessions.issue("bob");
 const registry=createCredentialRegistry();
 registry.addAccount("alice");registry.addAccount("bob");
 const {server}=createLoopbackRegistrationAPI({
  sessions,accountLookup:async id=>({id,userName:id}),
  challengeStore:createChallengeStore(),credentialRegistry:registry,
  sessionStore:sessions,origin:"https://id.example.org",rpID:"id.example.org"
 });
 server.listen(0,"127.0.0.1");await once(server,"listening");
 const base="http://127.0.0.1:"+server.address().port;
 const post=(route,token,origin,body={})=>fetch(base+route,{method:"POST",
  headers:{Cookie:"__Host-earthid="+token,Origin:origin,"Content-Type":"application/json"},
  body:JSON.stringify(body)});
 try{
  assert.equal((await post("/register/options",alice.token,"https://evil.example")).status,403);
  const begun=await post("/register/options",alice.token,"https://id.example.org");
  assert.equal(begun.status,200);
  const {handle,options}=await begun.json();
  assert.equal(typeof handle,"string");assert.equal(options.challenge.length,43);
  const fake={id:"fictional",rawId:"YQ",type:"public-key",response:{clientDataJSON:"!!!",attestationObject:"!!!"}};
  const cross=await post("/register/verify",bob.token,"https://id.example.org",{handle,response:fake});
  assert.equal(cross.status,403);
  assert.equal((await post("/register/verify",alice.token,"https://id.example.org",{handle,response:fake})).status,403);
  assert.equal(registry.getCredential("fictional"),null);
  const next=await (await post("/register/options",alice.token,"https://id.example.org")).json();
  const invalid=await post("/register/verify",alice.token,"https://id.example.org",{handle:next.handle,response:fake});
  assert.equal(invalid.status,403);
  assert.deepEqual(await invalid.json(),{registered:false});
  assert.equal(registry.getCredential("fictional"),null);
  sessions.revoke(alice.token);
  assert.equal((await post("/register/options",alice.token,"https://id.example.org")).status,401);
 }finally{
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  registry.close();
 }
});
test("HTTP pending ceremony bindings expire and are capped",async()=>{
 let now=1000;
 const sessions=createSessionStore(),alice=sessions.issue("alice"),registry=createCredentialRegistry();
 registry.addAccount("alice");
 const {server}=createLoopbackRegistrationAPI({
  sessions,accountLookup:async id=>({id,userName:id}),
  challengeStore:createChallengeStore(),credentialRegistry:registry,sessionStore:sessions,
  origin:"https://id.example.org",rpID:"id.example.org",now:()=>now
 });
 server.listen(0,"127.0.0.1");await once(server,"listening");
 const base="http://127.0.0.1:"+server.address().port;
 const post=(route,body={})=>fetch(base+route,{method:"POST",
  headers:{Cookie:"__Host-earthid="+alice.token,Origin:"https://id.example.org","Content-Type":"application/json"},
  body:JSON.stringify(body)});
 try{
  for(let i=0;i<256;i++)assert.equal((await post("/reauth/options")).status,200);
  assert.equal((await post("/reauth/options")).status,429);
  now+=120000;
  assert.equal((await post("/reauth/options")).status,200);
 }finally{
  await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
  registry.close();
 }
});
