import test from 'node:test';
import assert from 'node:assert/strict';
import {setSoundEnabled,soundEvent} from './sound.mjs';

test('procedural sound degrades safely when Web Audio is unavailable',async()=>{
  const hadAudio=Object.hasOwn(globalThis,'AudioContext');
  const previous=globalThis.AudioContext;
  try{
    delete globalThis.AudioContext;
    assert.equal(await setSoundEnabled(true),false);
    assert.equal(await setSoundEnabled(false),false);
    assert.doesNotThrow(()=>soundEvent('pulse'));
  }finally{
    if(hadAudio)globalThis.AudioContext=previous;
    else delete globalThis.AudioContext;
  }
});
