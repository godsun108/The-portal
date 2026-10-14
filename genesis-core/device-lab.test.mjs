import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../earthchain-genesis/earthid-device-lab.html",import.meta.url),"utf8");
test("iPhone Device Lab publishes truthful disabled controls and supported checks",()=>{
 assert.match(page,/viewport-fit=cover/);
 assert.match(page,/earthid-readiness\.mjs/);
 assert.match(page,/id="enroll" disabled/);
 assert.match(page,/id="login" disabled/);
 assert.match(page,/Not connected/);
 assert.match(page,/Not enabled/);
 assert.doesNotMatch(page,/<input[^>]+type=["']password/i);
 assert.doesNotMatch(page,/navigator\.credentials\.(create|get)\s*\(/);
 assert.doesNotMatch(page,/fetch\s*\(/);
 assert.doesNotMatch(page,/localStorage\./);
});
