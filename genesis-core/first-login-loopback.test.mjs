import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {once} from "node:events";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createSessionStore} from "./sessions.mjs";
import {createFirstLoginLoopbackAPI} from "./first-login-loopback.mjs";
import {readSessionCookie} from "./session-cookie.mjs";
const b64=x=>Buffer.from(x).toString("base64url");
const sha=x=>createHash("sha256").update(x).digest();
function device(){
 const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const key=publicKey.export({format:"jwk"});
 const cose=Buffer.concat([Buffer.from([0xa5,1,2,3,0x26,0x20,1,0x21,0x58,0x20]),
  Buffer.from(key.x,"base64url"),Buffer.from([0x22,0x58,0x20]),Buffer.from(key.y,"base64url")]);
 const id=b64(Buffer.from("earthid-initial-login-test"));
 function assertion(challenge,origin="https://id.example.org",counter=1){
  const clientData=Buffer.from(JSON.stringify({type:"webauthn.get",challenge,origin,crossOrigin:false}));
  const authData=Buffer.concat([sha(Buffer.from("id.example.org")),Buffer.from([0x05]),Buffer.alloc(4)]);
  authData.writeUInt32BE(counter,33);
  const signature=sign("sha256",Buffer.concat([authData,sha(clientData)]),privateKey);
  return {id,rawId:id,type:"public-key",response:{
   clientDataJSON:b64(clientData),authenticatorData:b64(authData),signature:b64(signature)
  },clientExtensionResults:{}};
 }
 return {id,cose,assertion};
}
test("first-time local login accepts valid signed credential without a preexisting session",async()=>{
 const registry=createCredentialRegistry(),sessions=createSessionStore();
 const authenticator=device();registry.addAccount("alice");registry.addAccount("bob");
 assert.equal(registry.addVerifiedWebAuthnCredential({
  id:authenticator.id,accountId:"alice",publicKey:authenticator.cose,counter:0}),true);
 const {server}=createFirstLoginLoopbackAPI({
  resolveAccountHint:async hint=>hint==="alice"?{id:"alice",credentialIds:[authenticator.id]}:null,
  challengeStore:createChallengeStore(),credentialRegistry:registry,sessionStore:sessions,
  origin:"https://id.example.org",rpID:"id.example.org"
 });
 server.listen(0,"127.0.0.1");await once(server,"listening");
 const url="http://127.0.0.1:"+server.address().port;
 const post=(route,body,origin="https://id.example.org")=>fetch(url+route,{method:"POST",
  headers:{Origin:origin,"Content-Type":"application/json"},body:JSON.stringify(body)});
 try{
  assert.equal((await post("/login/options",{accountHint:"alice"},"https://attacker.example")).status,403);
  assert.equal((await post("/login/options",{accountHint:"bob"})).status,403);
  const begin=await post("/login/options",{accountHint:"alice"});
  assert.equal(begin.status,200);
  const {handle,options}=await begin.json();
  assert.equal(options.challenge.length,43);
  const signed=authenticator.assertion(options.challenge);
  const ok=await post("/login/verify",{handle,response:signed,accountHint:"bob"});
  assert.equal(ok.status,200);
  assert.deepEqual(await ok.json(),{authenticated:true});
  const setCookie=ok.headers.get("set-cookie");
  assert.match(setCookie,/^__Host-earthid=/);
  assert.match(setCookie,/; Secure; HttpOnly; SameSite=Strict;/);
  const token=readSessionCookie(setCookie);
  assert.deepEqual(sessions.resolve(token),{subject:"alice",verified:true});
  assert.equal(registry.getWebAuthnCredential(authenticator.id,"alice").counter,1);
  assert.equal((await post("/login/verify",{handle,response:signed})).status,403);
  const beginWrong=await (await post("/login/options",{accountHint:"alice"})).json();
  const denied=await post("/login/verify",{handle:beginWrong.handle,
   response:authenticator.assertion(beginWrong.options.challenge,"https://attacker.example",2)});
  assert.equal(denied.status,403);
  assert.equal(denied.headers.get("set-cookie"),null);
  assert.equal(registry.getWebAuthnCredential(authenticator.id,"alice").counter,1);
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  registry.close();
 }
});
