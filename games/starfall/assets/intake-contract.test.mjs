import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSubmissionMetadata,stagingPaths} from './intake-contract.mjs';
const base={hull:'fire-horse',format:'png',sha256:'a'.repeat(64),byteLength:4096,manifest:{version:1,id:'fire-horse',image:'./assets/fire-horse.png',frameWidth:128,frameHeight:128,frames:4,fps:8}};
test('accepts bounded approved asset',()=>{assert.equal(validateSubmissionMetadata(base).ok,true);assert.deepEqual(stagingPaths(base),{image:'games/starfall/assets/staging/fire-horse.png',manifest:'games/starfall/assets/staging/fire-horse.json'});});
test('rejects path traversal and unapproved assets',()=>{for(const hull of ['../escape','other',''])assert.equal(validateSubmissionMetadata({...base,hull}).ok,false);});
test('rejects mismatched manifest, digest, and oversized payload',()=>{assert.equal(validateSubmissionMetadata({...base,manifest:{...base.manifest,id:'solar-lion'}}).ok,false);assert.equal(validateSubmissionMetadata({...base,sha256:'oops'}).ok,false);assert.equal(validateSubmissionMetadata({...base,byteLength:3_000_000}).ok,false);});
test('rejects prototype trickery and invalid frames',()=>{assert.equal(validateSubmissionMetadata(null).ok,false);assert.equal(validateSubmissionMetadata({...base,manifest:{...base.manifest,frames:0}}).ok,false);});
