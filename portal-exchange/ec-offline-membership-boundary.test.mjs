import test from 'node:test';import assert from 'node:assert/strict';import {inspectOfflineMembershipBoundary} from './ec-offline-membership-boundary.mjs';
const e=(epoch,ids)=>({epoch,validators:ids.map(id=>({id,publicKey:'k'.repeat(44)})),quorum:3});
const base={currentEpoch:e(0,['a','b','c','d']),nextEpoch:e(1,['b','c','d','e']),activationHeight:10};
test('old epoch is expected immediately before activation',()=>{const r=inspectOfflineMembershipBoundary({...base,height:9,observations:[{epoch:0,validatorId:'a'},{epoch:1,validatorId:'e'}]});assert.equal(r.expectedEpoch,0);assert.deepEqual(r.stale,['e'])});
test('new epoch is expected at activation',()=>{const r=inspectOfflineMembershipBoundary({...base,height:10,observations:[{epoch:0,validatorId:'a'},{epoch:1,validatorId:'e'}]});assert.equal(r.expectedEpoch,1);assert.deepEqual(r.stale,['a'])});
test('unknown membership cannot be counted',()=>{const r=inspectOfflineMembershipBoundary({...base,height:10,observations:[{epoch:1,validatorId:'a'},{epoch:2,validatorId:'e'}]});assert.equal(r.invalidCount,2);assert.equal(r.accepted.length,0)});
test('partitioned old view cannot establish finality',()=>{const r=inspectOfflineMembershipBoundary({...base,height:11,observations:[{epoch:0,validatorId:'b'},{epoch:0,validatorId:'c'},{epoch:0,validatorId:'d'}]});assert.equal(r.accepted.length,0);assert.equal(r.canAssertFinality,false)});
