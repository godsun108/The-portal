import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectEarthIDBrowser} from "../earthchain-genesis/earthid-readiness.mjs";
const html=readFileSync(new URL("../earthchain-genesis/earthid-readiness.html",import.meta.url),"utf8");
test("browser readiness stays read-only and does not claim live authentication",()=>{
 const supported={isSecureContext:true,PublicKeyCredential:class TestCredential {},
  navigator:{credentials:{create(){},get(){}}}};
 supported.PublicKeyCredential.parseCreationOptionsFromJSON=x=>x;
 supported.PublicKeyCredential.parseRequestOptionsFromJSON=x=>x;
 const state=inspectEarthIDBrowser(supported);
 assert.equal(state.readyForFutureDeviceTest,true);
 assert.equal(state.backendConnected,false);
 assert.equal(state.signInAvailable,false);
 assert.equal(inspectEarthIDBrowser({}).readyForFutureDeviceTest,false);
 assert.equal(inspectEarthIDBrowser({...supported,isSecureContext:false}).readyForFutureDeviceTest,false);
 assert.equal(inspectEarthIDBrowser({...supported,navigator:{credentials:{create(){}}}}).nativeWebAuthn,false);
});
test("published page gives accurate no-backend warnings and never initiates credentials",()=>{
 assert.match(html,/Secure authentication backend/);
 assert.match(html,/Not connected/);
 assert.match(html,/Live sign-in/);
 assert.match(html,/Not available/);
 assert.match(html,/earthid-readiness\.mjs/);
 assert.doesNotMatch(html,/credentials\.(create|get)\s*\(/);
 assert.doesNotMatch(html,/fetch\s*\(/);
 assert.doesNotMatch(html,/<button[^>]*sign.?in/i);
});
