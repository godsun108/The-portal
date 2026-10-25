import test from 'node:test';import assert from 'node:assert/strict';import {buildTestMerkle,testInclusionProof,verifyTestInclusion} from './ec-offline-merkle.mjs';
const ids=['a'.repeat(64),'b'.repeat(64),'c'.repeat(64)];
test('deterministic root and valid odd-leaf inclusion proofs',async()=>{const a=await buildTestMerkle(ids),b=await buildTestMerkle(ids);assert.equal(a.root,b.root);for(let i=0;i<ids.length;i++)assert.equal(await verifyTestInclusion(await testInclusionProof(ids,i),a.root),true)});
test('tampered transaction cannot prove inclusion',async()=>{const p=await testInclusionProof(ids,1);assert.equal(await verifyTestInclusion({...p,transactionId:'d'.repeat(64)},p.root),false)});
test('tampered sibling cannot prove inclusion',async()=>{const p=await testInclusionProof(ids,1);assert.equal(await verifyTestInclusion({...p,siblings:[{...p.siblings[0],hash:'f'.repeat(64)},...p.siblings.slice(1)]},p.root),false)});
test('wrong root cannot prove inclusion',async()=>{const p=await testInclusionProof(ids,0);assert.equal(await verifyTestInclusion(p,'0'.repeat(64)),false)});
test('rejects duplicate transaction IDs and invalid index',async()=>{await assert.rejects(buildTestMerkle([ids[0],ids[0]]));await assert.rejects(testInclusionProof(ids,3))});
