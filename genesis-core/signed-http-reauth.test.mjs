import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
import {once} from "node:events";
import {createSessionStore} from "./sessions.mjs";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createLoopbackRegistrationAPI} from "./loopback-passkey-registration.mjs";

const encode=x=>Buffer.from(x).toString("base64url");
const sha256=x=>createHash("sha256").update(x).digest();
function makeAuthenticator(){
 const {privateKey,publicKey}=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const jwk=publicKey.export({format:"jwk"});
 const cose=new Uint8Array(Buffer.concat([
  Buffer.from([0xa5,1,2,3,0x26,0x20,1,0x21,0x58,0x20]),
  Buffer.from(jwk.x,"base64url"),Buffer.from([0x22,0x58,0x20]),Buffer.from(jwk.y,"base64url")
 ]));
 const id=encode(Buffer.from("earthid-http-reauth-proof"));
 function assertion(challenge,{origin="https://id.example.org",counter=1}={}){
  const clientData=Buffer.from(JSON.stringify({type:"webauthn.get",challenge,origin,crossOrigin:false}));
  const authenticatorData=Buffer.concat([sha256(Buffer.from("id.example.org")),Buffer.from([0x05]),Buffer.alloc(4)]);
  authenticatorData.writeUInt32BE(counter,33);
  const signature=sign("sha256",Buffer.concat([authenticatorData,sha256(clientData)]),privateKey);
  return {id,rawId:id,type:"public-key",response:{
   clientDataJSON:encode(clientData),authenticatorData:encode(authenticatorData),signature:encode(signature)
  },clientExtensionResults:{}};
 }
 return {id,cose,assertion};
}

test("signed passkey assertion succeeds over loopback reauth HTTP and cannot replay",async()=>{
 const sessions=createSessionStore();
 const alice=sessions.issue("alice").token;
 const bob=sessions.issue("bob").token;
 const keys=createCredentialRegistry();
 const device=makeAuthenticator();
 keys.addAccount("alice");keys.addAccount("bob");
 assert.equal(keys.addVerifiedWebAuthnCredential({id:device.id,accountId:"alice",publicKey:device.cose,counter:0}),true);
 const {server}=createLoopbackRegistrationAPI({sessions,sessionStore:sessions,
  accountLookup:async id=>({id,userName:id}),credentialRegistry:keys,
  challengeStore:createChallengeStore(),origin:"https://id.example.org",rpID:"id.example.org"});
 server.listen(0,"127.0.0.1");
 await once(server,"listening");
 const base="http://127.0.0.1:"+server.address().port;
 const post=(route,token,body={})=>fetch(base+route,{method:"POST",headers:{
  Cookie:"__Host-earthid="+token,Origin:"https://id.example.org",
  "Content-Type":"application/json"},body:JSON.stringify(body)});
 try{
  const start=await post("/reauth/options",alice);
  assert.equal(start.status,200);
  const {handle,options}=await start.json();
  const signed=device.assertion(options.challenge);
  assert.equal((await post("/reauth/verify",bob,{handle,response:signed})).status,403);
  assert.equal(keys.getWebAuthnCredential(device.id,"alice").counter,0);
  // Cross-session attempt consumes the opaque handle.
  assert.equal((await post("/reauth/verify",alice,{handle,response:signed})).status,403);
  const next=await (await post("/reauth/options",alice)).json();
  const result=await post("/reauth/verify",alice,{handle:next.handle,response:device.assertion(next.options.challenge)});
  assert.equal(result.status,200);
  assert.deepEqual(await result.json(),{authenticated:true});
  assert.equal(keys.getWebAuthnCredential(device.id,"alice").counter,1);
  assert.equal((await post("/reauth/verify",alice,{handle:next.handle,response:device.assertion(next.options.challenge)})).status,403);
  const invalid=await (await post("/reauth/options",alice)).json();
  assert.equal((await post("/reauth/verify",alice,{handle:invalid.handle,response:device.assertion(invalid.options.challenge,{origin:"https://attacker.example.org",counter:2})})).status,403);
  assert.equal(keys.getWebAuthnCredential(device.id,"alice").counter,1);
 }finally{
  await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  keys.close();
 }
});
