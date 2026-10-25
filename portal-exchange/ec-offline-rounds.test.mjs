import test from 'node:test';import assert from 'node:assert/strict';import {evaluateOfflineRounds} from './ec-offline-rounds.mjs';
const validators=['a','b','c','d'].map(id=>({id,publicKey:''})),base={networkId:'earthchain-test',height:1,validators,quorum:3};
test('timeout advances to next deterministic round',async()=>{const r=await evaluateOfflineRounds({...base,rounds:[{round:0,votes:[],timedOut:true},{round:1,votes:[],timedOut:false}]});assert.equal(r.status,'WAIT_FOR_MORE_MESSAGES');assert.equal(r.history.length,2)});
test('all timed-out rounds end without claiming finality',async()=>{const r=await evaluateOfflineRounds({...base,rounds:[{round:0,votes:[],timedOut:true},{round:1,votes:[],timedOut:true}]});assert.equal(r.status,'EXHAUSTED_TIMEOUT_ROUNDS');assert.equal(r.canAssertFinality,false)});
test('cannot skip a round',async()=>{await assert.rejects(evaluateOfflineRounds({...base,rounds:[{round:1,votes:[],timedOut:true}]}),/Nonsequential/)});
test('reject excessive rounds',async()=>{await assert.rejects(evaluateOfflineRounds({...base,maxRounds:1,rounds:[{round:0,votes:[],timedOut:true},{round:1,votes:[],timedOut:true}]}),/Invalid round/)});
