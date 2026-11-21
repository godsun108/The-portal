import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(path,'utf8');
test('Rigveda source inventory is complete, linked and fail-closed',async()=>{
 const m=JSON.parse(await read('data/rigveda/source-manifest.json'));
 assert.equal(m.schema,'portal.rigveda.sources.v1');
 assert.equal(m.structure.mandalas,10);
 assert.equal(m.structure.suktas,1028);
 assert.equal(m.offline_corpus,false);
 assert.equal(m.public_release,false);
 assert.ok(m.sources.length>=3);
 const ids=new Set();
 for(const source of m.sources){
  assert.ok(!ids.has(source.id));ids.add(source.id);
  assert.match(source.url,/^https:\/\//);
  assert.equal(source.import_status,'blocked');
  assert.ok(source.rights.length>30);
 }
 assert.match(m.sources.find(s=>s.id==='gretil').rights,/commercial use/i);
});
test('Rigveda preview exposes ten mandalas and never fabricates hymns',async()=>{
 const html=await read('rigveda/index.html');
 assert.match(html,/<html lang="en">/);
 assert.match(html,/for\(let i=1;i<=10;i\+\+\)/);
 assert.match(html,/Maṇḍala/);
 assert.match(html,/id="sanskrit"/);
 assert.match(html,/id="english"/);
 assert.match(html,/not yet imported/i);
 assert.match(html,/textContent=item.title/);
 assert.match(html,/source-manifest\.json/);
 assert.doesNotMatch(html,/<iframe/i);
});
