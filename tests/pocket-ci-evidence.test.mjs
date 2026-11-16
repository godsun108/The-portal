import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBrowserEvidence, inspectBrowserEvidence, serializeBrowserEvidence} from '../pocket-ci-evidence.mjs';
const now=new Date('2026-10-13T23:00:00Z');
const pass={passed:true,checks:[{label:'source is reachable',passed:true}]};
test('genuine browser result exported as explicitly untrusted',()=>{
 const report=makeBrowserEvidence('same-origin-static-smoke-only',pass,now);
 assert.equal(report.evidence_type,'untrusted-browser-local');
 assert.deepEqual(inspectBrowserEvidence(report),{valid:true,status:'untrusted-browser-pass'});
});
test('failure stays failure',()=>{
 const report=makeBrowserEvidence('browser-engine-self-test',{passed:false,checks:[{label:'test',passed:false}]},now);
 assert.equal(inspectBrowserEvidence(report).status,'untrusted-browser-fail');
});
test('reject a forged green summary',()=>{
 assert.throws(()=>makeBrowserEvidence('browser-engine-self-test',{passed:true,checks:[{label:'test',passed:false}]},now));
});
test('reject unsupported evidence scope',()=>assert.throws(()=>makeBrowserEvidence('authenticated-production-health',pass,now)));
test('raw logs and secrets are not exported',()=>{
 const report=makeBrowserEvidence('browser-engine-self-test',{...pass,stdout_tail:'secret',privateToken:'secret',checks:[{...pass.checks[0],stderr_tail:'secret'}]},now);
 assert.equal(JSON.stringify(report).includes('secret'),false);
});
test('reject mutated counts on reinspection',()=>{
 const report=makeBrowserEvidence('browser-engine-self-test',pass,now);
 report.passed=0;
 assert.equal(inspectBrowserEvidence(report).valid,false);
});
test('reject empty and oversized checks',()=>{
 assert.throws(()=>makeBrowserEvidence('browser-engine-self-test',{passed:true,checks:[]},now));
 assert.throws(()=>makeBrowserEvidence('browser-engine-self-test',{passed:true,checks:Array.from({length:65},()=>({label:'test',passed:true}))},now));
});

test('downloaded JSON parses without trailing literal escapes',()=>{
 const content=serializeBrowserEvidence('browser-engine-self-test',pass,now);
 assert.equal(content.endsWith('\n'),true);
 const parsed=JSON.parse(content);
 assert.equal(parsed.evidence_type,'untrusted-browser-local');
});
