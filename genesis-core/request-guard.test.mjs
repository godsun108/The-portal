import test from "node:test";
import assert from "node:assert/strict";
import {createRequestGuard} from "./request-guard.mjs";
const guard=createRequestGuard({trustedOrigin:"https://id.example.org"});
test("same-origin mutations allowed; origin is compulsory",()=>{
 for(const method of ["POST","PUT","PATCH","DELETE"]){
  assert.equal(guard({method,headers:{origin:"https://id.example.org","sec-fetch-site":"same-origin"}}).allowed,true);
  assert.equal(guard({method,headers:{"sec-fetch-site":"same-origin"}}).allowed,false);
 }
});
test("cross-origin, scheme changes, subdomains, prefix and port attacks denied",()=>{
 for(const supplied of ["https://id.example.org.attacker.test","http://id.example.org","https://evil.id.example.org","https://id.example.org:444","null","https://id.example.org/"]){
  assert.equal(guard({method:"POST",headers:{origin:supplied}}).allowed,false);
 }
 assert.equal(guard({method:"POST",headers:{origin:"https://id.example.org","sec-fetch-site":"cross-site"}}).allowed,false);
 assert.equal(guard({method:"POST",headers:{origin:"https://id.example.org","sec-fetch-site":"same-site"}}).allowed,false);
});
test("safe requests avoid origin requirement but reject explicitly cross-site fetch metadata",()=>{
 assert.equal(guard({method:"GET",headers:{}}).allowed,true);
 assert.equal(guard({method:"HEAD",headers:{"sec-fetch-site":"same-origin"}}).allowed,true);
 assert.equal(guard({method:"GET",headers:{"sec-fetch-site":"cross-site"}}).allowed,false);
 assert.equal(guard({method:"TRACE",headers:{}}).allowed,false);
});
test("trusted configuration accepts only canonical HTTPS origin",()=>{
 for(const trustedOrigin of ["http://id.example.org","https://id.example.org/path","https://id.example.org/","https://id.example.org?x=1","https://alice@id.example.org"]){
  assert.throws(()=>createRequestGuard({trustedOrigin}));
 }
});
