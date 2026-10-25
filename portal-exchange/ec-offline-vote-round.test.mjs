import test from 'node:test';import assert from 'node:assert/strict';import {simulateOfflineVoteRound} from './ec-offline-vote-round.mjs';
const validatorIds=['a','b','c','d'],A='a'.repeat(64),B='b'.repeat(64),proposals=[{commitment:A},{commitment:B}];
const run=votes=>simulateOfflineVoteRound({validatorIds,proposals,votes,quorum:3});
test('three of four simulated votes form a research quorum',()=>{const r=run(['a','b','c'].map(validatorId=>({validatorId,commitment:A})));assert.equal(r.status,'SIMULATED_QUORUM');assert.equal(r.candidate,A);assert.equal(r.canAssertFinality,false)});
test('two of four cannot form quorum',()=>{assert.equal(run(['a','b'].map(validatorId=>({validatorId,commitment:A}))).status,'NO_QUORUM')});
test('equivocating validator is excluded from both tallies',()=>{const votes=[{validatorId:'a',commitment:A},{validatorId:'a',commitment:B},...['b','c'].map(validatorId=>({validatorId,commitment:A}))];const r=run(votes);assert.equal(r.status,'EQUIVOCATION_OBSERVED');assert.deepEqual(r.equivocators,['a']);assert.equal(r.counts[A],2);assert.equal(r.candidate,null)});
test('unsafe two-of-four quorum is rejected',()=>{assert.throws(()=>simulateOfflineVoteRound({validatorIds,proposals,votes:[],quorum:2}),/Unsafe/)});
test('unknown validators and proposals cannot add votes',()=>{const r=run([{validatorId:'x',commitment:A},{validatorId:'a',commitment:'f'.repeat(64)}]);assert.equal(r.rejected.length,2);assert.equal(r.candidate,null)});
