import test from "node:test";
import assert from "node:assert/strict";
import {createChallengeStore} from "./challenges.mjs";
import {createCredentialRegistry} from "./credentials.mjs";
import {createBrowserCeremonyService} from "./browser-ceremony-service.mjs";
const origin="https://id.example.org";
test("browser begin/finish passes no client account ID and denies forged registration",async()=>{
 const challengeStore=createChallengeStore(),credentialRegistry=createCredentialRegistry();
 let sessions=0;
 try{
  credentialRegistry.addAccount("alice");credentialRegistry.addAccount("bob");
  const service=createBrowserCeremonyService({challengeStore,credentialRegistry,
   sessionStore:{issue(){sessions++;throw Error("no sessions expected")}},
   expectedOrigin:origin,rpID:"id.example.org"});
  const begin=await service.beginRegistration({trustedAccountId:"alice",trustedUserName:"Alice"});
  assert.equal(begin.options.challenge.length,43);
  assert.equal(begin.handle.length,43);
  const bad={id:"fakecredential",rawId:"YQ",type:"public-key",
   response:{clientDataJSON:"!!!",attestationObject:"!!!"}};
  assert.deepEqual(await service.finishRegistration({handle:begin.handle,response:bad,accountId:"bob"}),{registered:false});
  assert.deepEqual(await service.finishRegistration({handle:begin.handle,response:bad}),{registered:false});
  assert.equal(credentialRegistry.getCredential("fakecredential"),null);
  assert.equal(sessions,0);
 }finally{credentialRegistry.close();}
});
test("login ceremony is single-use, purpose-bound, expiry-bound, no client-selected identity",async()=>{
 let now=1000;
 const challengeStore=createChallengeStore(),credentialRegistry=createCredentialRegistry();
 try{
  credentialRegistry.addAccount("alice");
  const service=createBrowserCeremonyService({challengeStore,credentialRegistry,
   sessionStore:{issue(){throw Error("unverified session")}},
   expectedOrigin:origin,rpID:"id.example.org",now:()=>now,ttlMs:50});
  const login=await service.beginAuthentication({trustedAccountId:"alice"});
  assert.equal(login.options.challenge.length,43);
  assert.deepEqual(await service.finishRegistration({handle:login.handle,response:{id:"x"}}),{registered:false});
  assert.deepEqual(await service.finishAuthentication({handle:login.handle,response:{id:"x"}}),{authenticated:false});
  const expired=await service.beginAuthentication({trustedAccountId:"alice"});
  now=1050;
  assert.deepEqual(await service.finishAuthentication({handle:expired.handle,response:{id:"x"},accountId:"bob"}),{authenticated:false});
 }finally{credentialRegistry.close();}
});

test("parallel redemption of one registration handle is consumed once",async()=>{
 const challengeStore=createChallengeStore(),credentialRegistry=createCredentialRegistry();
 try{
  credentialRegistry.addAccount("alice");
  const service=createBrowserCeremonyService({challengeStore,credentialRegistry,
   sessionStore:{issue(){throw Error("no session expected")}},
   expectedOrigin:origin,rpID:"id.example.org"});
  const begin=await service.beginRegistration({trustedAccountId:"alice",trustedUserName:"Alice"});
  const forged={id:"parallel-forgery",rawId:"YQ",type:"public-key",
   response:{clientDataJSON:"!!!",attestationObject:"!!!"}};
  const results=await Promise.all([
   service.finishRegistration({handle:begin.handle,response:forged}),
   service.finishRegistration({handle:begin.handle,response:forged})
  ]);
  assert.deepEqual(results,[{registered:false},{registered:false}]);
  assert.equal(credentialRegistry.getCredential("parallel-forgery"),null);
 }finally{credentialRegistry.close();}
});
