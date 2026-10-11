import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAtlas,paintAtlas,preloadAtlas} from './sprite-atlas.mjs';
const valid={version:1,id:'fire-horse',image:'./assets/fire-horse.png',frameWidth:128,frameHeight:128,frames:4,fps:8};
test('accepts bounded local atlas',()=>assert.equal(validateAtlas(valid),true));
test('accepts local SVG atlas',()=>assert.equal(validateAtlas({...valid,image:'./assets/fire-horse.svg'}),true));
test('rejects external image URLs and unknown hulls',()=>{
 for(const image of ['https://example.com/hull.png','../secrets.png','./assets/../../x.png'])assert.equal(validateAtlas({...valid,image}),false);
 assert.equal(validateAtlas({...valid,id:'other'}),false);
});
test('rejects unreasonable memory and timing parameters',()=>{
 assert.equal(validateAtlas({...valid,frames:100000}),false);
 assert.equal(validateAtlas({...valid,fps:0}),false);
 assert.equal(validateAtlas({...valid,frameWidth:8192}),false);
});
test('unknown hull never loads or renders',async()=>{
 assert.equal(await preloadAtlas('unknown'),false);
 assert.equal(paintAtlas({},'unknown',0),false);
});
