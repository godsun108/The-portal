import test from 'node:test';import assert from 'node:assert/strict';
import {createGenesis,applyTransaction,validateChain} from './earthchain-prototype.mjs';
const genesis={alice:70,bob:30};
test('genesis supply remains capped and transfers conserve it',()=>{const s=validateChain(genesis,[{from:'alice',to:'bob',amount:20,nonce:'1'},{from:'bob',to:'alice',amount:5,nonce:'2'}]);assert.equal(s.supply,100);assert.deepEqual(s.balances,{alice:55,bob:45});assert.equal(s.height,2)});
test('independent replays of same transactions agree',()=>{const tx=[{from:'alice',to:'bob',amount:1,nonce:'x'}];assert.deepEqual(validateChain(genesis,tx),validateChain(genesis,tx))});
test('double spend and replay rejected',()=>{assert.throws(()=>validateChain(genesis,[{from:'alice',to:'bob',amount:71,nonce:'x'}]),/Insufficient/);const tx={from:'alice',to:'bob',amount:1,nonce:'x'};assert.throws(()=>validateChain(genesis,[tx,tx]),/Replay/)});
test('failed transfer cannot mutate prior state',()=>{const s=createGenesis(genesis);assert.throws(()=>applyTransaction(s,{from:'alice',to:'bob',amount:999,nonce:'x'}),/Insufficient/);assert.deepEqual(s.balances,genesis)});
test('invalid allocations and inflation rejected',()=>{assert.throws(()=>createGenesis({alice:Number.MAX_SAFE_INTEGER,bob:1}),/overflow/);assert.throws(()=>validateChain(genesis,[{from:'alice',to:'bob',amount:-1,nonce:'x'}]),/Invalid/)});
