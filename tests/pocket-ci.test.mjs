import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectReport,selfTest} from '../pocket-ci-core.mjs';
const report={profile:'genesis-smoke',total:1,passed:1,timestamp_utc:'2026-10-13T21:00:00Z',results:[{status:'pass'}]};
test('browser engine self-tests genuinely pass',()=>{
 const result=selfTest();assert.equal(result.passed,true);assert.equal(result.checks.length,10);
});
test('valid fixture is explicitly untrusted',()=>assert.equal(inspectReport(report).kind,'untrusted-pass-report'));
test('failed local test never becomes pass',()=>{
 const r=inspectReport({...report,passed:0,results:[{status:'fail'}]});
 assert.equal(r.kind,'untrusted-failure-report');assert.equal(r.passed,true);
});
test('inconsistent pass counts rejected',()=>assert.equal(inspectReport({...report,passed:0}).passed,false));
test('wrong number of profile checks rejected',()=>assert.equal(inspectReport({...report,profile:'foundry'}).passed,false));
test('invalid object never trusted',()=>assert.equal(inspectReport(null).passed,false));
test('timestamp without zone rejected',()=>assert.equal(inspectReport({...report,timestamp_utc:'2026-10-13T21:00:00'}).passed,false));
test('unknown status rejected',()=>assert.equal(inspectReport({...report,results:[{status:'skip'}]}).passed,false));
