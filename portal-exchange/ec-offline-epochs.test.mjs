import test from 'node:test';import assert from 'node:assert/strict';import {validateOfflineValidatorEpoch,inspectOfflineEpochTransition} from './ec-offline-epochs.mjs';
const epoch=n=>({epoch:n,validators:['a','b','c','d'].map(id=>({id,publicKey:'k'.repeat(44)})),quorum:3});
test('safe four-validator epoch accepted',()=>{assert.equal(validateOfflineValidatorEpoch(epoch(0)).quorum,3)});
test('unsafe quorum rejected',()=>{assert.throws(()=>validateOfflineValidatorEpoch({...epoch(0),quorum:2}),/Unsafe/)});
test('duplicate validator identity rejected',()=>{const e=epoch(0);e.validators[3].id='a';assert.throws(()=>validateOfflineValidatorEpoch(e),/identities/)});
test('unverified epoch approval blocks transition',()=>{const r=inspectOfflineEpochTransition(epoch(0),epoch(1),{activationHeight:10});assert.equal(r.allowed,false);assert.ok(r.reasons.includes('prior_epoch_approval_unverified'))});
test('nonsequential epoch blocks transition',()=>{const r=inspectOfflineEpochTransition(epoch(0),epoch(2),{approvedByPriorEpoch:true,activationHeight:10});assert.equal(r.allowed,false)});
