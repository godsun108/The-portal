import test from "node:test";
import assert from "node:assert/strict";
import {verifyEarthIDAuthentication,verifyEarthIDRegistration} from "./simplewebauthn-verifier.mjs";
test("real verifier adapter rejects missing and revoked credential before cryptography",async()=>{
 const expected={response:{id:"a"},expectedChallenge:"bad",expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org",requireUserVerification:true};
 assert.deepEqual(await verifyEarthIDAuthentication(expected),{verified:false});
 assert.deepEqual(await verifyEarthIDAuthentication({...expected,credential:{id:"a",revoked:true,publicKey:new Uint8Array([1]),counter:0}}),{verified:false});
});
test("actual WebAuthn library rejects malformed assertion",async()=>{
 await assert.rejects(()=>verifyEarthIDAuthentication({
  response:{id:"YQ",rawId:"YQ",type:"public-key",response:{clientDataJSON:"!!!",authenticatorData:"!!!",signature:"!!!"}},
  expectedChallenge:"abc",expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org",
  requireUserVerification:true,
  credential:{id:"YQ",publicKey:new Uint8Array([1,2,3]),counter:0,transports:[]}
 }));
});
test("actual WebAuthn registration library rejects malformed attestation",async()=>{
 await assert.rejects(()=>verifyEarthIDRegistration({
  response:{id:"YQ",rawId:"YQ",type:"public-key",response:{clientDataJSON:"!!!",attestationObject:"!!!"}},
  expectedChallenge:"abc",expectedOrigin:"https://id.example.org",expectedRPID:"id.example.org",
  requireUserVerification:true
 }));
});
