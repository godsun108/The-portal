import test from 'node:test';import assert from 'node:assert/strict';import {simulateOfflineDelivery} from './ec-offline-delivery.mjs';
const validatorIds=['a','b','c','d'],A='a'.repeat(64),proposals=[{commitment:A}],messages=validatorIds.flatMap(from=>validatorIds.map(to=>({from,to,commitment:A})));
test('all peers observe a simulated quorum with full delivery',()=>{const r=simulateOfflineDelivery({validatorIds,proposals,messages,quorum:3});assert.ok(validatorIds.every(id=>r.views[id].candidate===A));assert.equal(r.canAssertFinality,false)});
test('partitioned peer sees no quorum',()=>{const r=simulateOfflineDelivery({validatorIds,proposals,messages,quorum:3,dropTo:['d']});assert.equal(r.views.d.candidate,null);assert.equal(r.views.a.candidate,A)});
test('partial delivery does not manufacture quorum',()=>{const r=simulateOfflineDelivery({validatorIds,proposals,messages:messages.filter(m=>m.from==='a'||m.from==='b'),quorum:3});assert.ok(validatorIds.every(id=>r.views[id].candidate===null))});
test('reject unknown partition target',()=>{assert.throws(()=>simulateOfflineDelivery({validatorIds,proposals,messages,quorum:3,dropTo:['x']}),/Unknown/)});
