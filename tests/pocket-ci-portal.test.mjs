import test from 'node:test';
import assert from 'node:assert/strict';
import { runPortalSmoke, REQUIRED_FILES } from '../pocket-ci-portal.mjs';
const html = '<html><head><title>TV</title></head><body><div id="a"></div><div id="b"></div></body></html>';
const makeFetcher = (overrides = {}) => async (url, options) => {
  assert.deepEqual(options, {cache:'no-store', credentials:'omit', redirect:'error'});
  const value = Object.hasOwn(overrides, url) ? overrides[url] : (url === 'tv.html' ? html : '/* substantial JavaScript source */');
  if (value instanceof Error) throw value;
  return {ok: value !== null, type: 'basic', text: async () => value ?? ''};
};
const parse = (str) => ({querySelectorAll: () => [...str.matchAll(/id="([^"]+)"/g)].map(x => ({id:x[1]})), querySelector: (sel) => sel === 'title' ? {textContent: /<title>(.*?)<\/title>/.exec(str)?.[1]} : null});
test('baseline static files and document contracts pass', async () => {const out=await runPortalSmoke(makeFetcher(),parse); assert.equal(out.passed,true);assert.equal(out.checks.length,6);});
test('network failure cannot report green', async () => {const out=await runPortalSmoke(makeFetcher({'tv-network.js': new Error('offline')}),parse); assert.equal(out.passed,false);});
test('empty response cannot report green', async () => {const out=await runPortalSmoke(makeFetcher({'tv-catalog.js': ''}),parse); assert.equal(out.passed,false);});
test('duplicate document IDs cannot report green', async () => {const out=await runPortalSmoke(makeFetcher({'tv.html': html.replace('id="b"','id="a"')}),parse); assert.equal(out.passed,false);});
test('only predetermined paths are requested', async () => {const called=[];await runPortalSmoke(async (url,opts)=>{called.push(url);return makeFetcher()(url,opts);},parse);assert.deepEqual(called,REQUIRED_FILES);});

test('missing TV HTML still emits six explicit checks', async () => {const out=await runPortalSmoke(makeFetcher({'tv.html':null}),parse);assert.equal(out.passed,false);assert.equal(out.checks.length,6);assert.equal(out.checks.slice(-2).every(x=>x.passed===false),true);});
