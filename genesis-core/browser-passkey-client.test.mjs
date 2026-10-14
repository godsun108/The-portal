import test from "node:test";
import assert from "node:assert/strict";
import {createBrowserPasskeyClient} from "./browser-passkey-client.mjs";
function fixture({secure=true,finishOK=true}={}){
 const calls=[];
 const platform={
  isSecureContext:secure,
  PublicKeyCredential:{
   parseCreationOptionsFromJSON:json=>{calls.push("creation-options");return json;},
   parseRequestOptionsFromJSON:json=>{calls.push("request-options");return json;}
  },
  navigator:{credentials:{
   create:async ({publicKey})=>{calls.push("create");assert.equal(publicKey.rp.name,"EarthID");return {toJSON:()=>({id:"test-registration"})};},
   get:async ({publicKey})=>{calls.push("get");assert.equal(publicKey.rpId,"id.example.org");return {toJSON:()=>({id:"test-authentication"})};}
  }}
 };
 const client=createBrowserPasskeyClient({
  platform,
  beginRegistration:async()=>({handle:"trusted-handle",options:{rp:{name:"EarthID"}}}),
  finishRegistration:async data=>{calls.push("finish-registration");assert.equal(data.handle,"trusted-handle");return {registered:finishOK};},
  beginAuthentication:async()=>({handle:"trusted-handle",options:{rpId:"id.example.org"}}),
  finishAuthentication:async data=>{calls.push("finish-authentication");assert.equal(data.handle,"trusted-handle");return {authenticated:finishOK};}
 });
 return {client,calls};
}
test("browser passkey transport waits for server confirmation before reporting success",async()=>{
 const {client,calls}=fixture();
 assert.equal(client.available(),true);
 assert.deepEqual(await client.register(),{registered:true});
 assert.deepEqual(await client.authenticate(),{authenticated:true});
 assert.deepEqual(calls,["creation-options","create","finish-registration","request-options","get","finish-authentication"]);
});
test("server denial is never reported as a completed browser login or registration",async()=>{
 const {client}=fixture({finishOK:false});
 await assert.rejects(client.register(),/not verified/);
 await assert.rejects(client.authenticate(),/not verified/);
});
test("insecure browser context rejects before requesting credentials",async()=>{
 const {client,calls}=fixture({secure:false});
 assert.equal(client.available(),false);
 await assert.rejects(client.authenticate(),/unavailable/);
 await assert.rejects(client.register(),/unavailable/);
 assert.deepEqual(calls,[]);
});
test("missing trusted server callbacks cannot trigger platform credential prompts",async()=>{
 const {client}=fixture();
 const stripped=createBrowserPasskeyClient({platform:{
  isSecureContext:true,
  PublicKeyCredential:{parseCreationOptionsFromJSON:x=>x,parseRequestOptionsFromJSON:x=>x},
  navigator:{credentials:{create:async()=>{throw Error("unexpected")},get:async()=>{throw Error("unexpected")}}}
 }});
 assert.equal(stripped.available(),true);
 await assert.rejects(stripped.register(),/unavailable/);
 await assert.rejects(stripped.authenticate(),/unavailable/);
 assert.equal(client.available(),true);
});
