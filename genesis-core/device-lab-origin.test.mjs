import test from "node:test";
import assert from "node:assert/strict";
import {validateDeviceLabOrigin} from "./device-lab-origin.mjs";
test("accepts canonical HTTPS service origins and same/parent RP identity",()=>{
 assert.deepEqual(validateDeviceLabOrigin({origin:"https://id.example.org",rpID:"id.example.org"}),
  {origin:"https://id.example.org",rpID:"id.example.org",hostname:"id.example.org"});
 assert.equal(validateDeviceLabOrigin({origin:"https://test.id.example.org",rpID:"id.example.org"}).rpID,"id.example.org");
});
test("rejects scheme, origin mismatch, preview host, ports and malformed URLs",()=>{
 const attempts=[
  ["http://id.example.org","id.example.org"],["https://evil.example.org","id.example.org"],
  ["https://id.example.org:444","id.example.org"],["https://id.example.org/path","id.example.org"],
  ["https://id.example.org/","id.example.org"],["https://id.example.org?x=1","id.example.org"],
  ["https://u:p@id.example.org","id.example.org"],["https://127.0.0.1","127.0.0.1"],
  ["https://godsun108.github.io","godsun108.github.io"],["https://id.example.org","github.io"]
 ];
 for(const [origin,rpID] of attempts)assert.throws(()=>validateDeviceLabOrigin({origin,rpID}),origin);
});
