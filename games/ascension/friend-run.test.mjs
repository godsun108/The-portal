import test from 'node:test';
import assert from 'node:assert/strict';
import {validateFriendRun,createFriendRun} from './friend-run.mjs';
const good={schema:'ascension.friend-run.v1',game:'ASCENSION',height:250,relics:3,duration:2,samples:[[0,0,.5],[1,100,.6],[2,250,.4]]};
test('accepts and normalizes a valid friend run',()=>{const run=validateFriendRun(good);assert.equal(run.height,250);assert.equal(run.samples.length,3)});
test('rejects wrong schema and malformed samples',()=>{assert.throws(()=>validateFriendRun({...good,schema:'wrong'}));assert.throws(()=>validateFriendRun({...good,samples:[[0,0,.5],[0,10,.5]]}))});
test('rejects out-of-bounds coordinates and oversized recordings',()=>{assert.throws(()=>validateFriendRun({...good,samples:[[0,0,1.2],[1,100,.5]]}));assert.throws(()=>validateFriendRun({...good,samples:Array.from({length:12001},(_,i)=>[i*.001,i*.01,.5])}))});
test('builds a portable run from a completed game state',()=>{const run=createFriendRun({height:250,count:3,elapsed:2,recording:good.samples});assert.equal(run.game,'ASCENSION');assert.equal(run.relics,3)});
