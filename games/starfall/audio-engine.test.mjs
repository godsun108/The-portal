import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoundEngine} from './audio-engine.mjs';
class Param{setValueAtTime(){} exponentialRampToValueAtTime(){} setTargetAtTime(){}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.started=0;}connect(){}start(){this.started++;}stop(){}}
class FakeAudioContext{constructor(){this.currentTime=1;this.state='running';this.destination={};this.oscillators=[];FakeAudioContext.last=this;}createGain(){return new Node();}createOscillator(){const n=new Node();this.oscillators.push(n);return n;}createBiquadFilter(){return new Node();}async resume(){}async close(){}}
test('audio engine starts its ambient bed and synthesizes gameplay cues',async()=>{
 const sound=createSoundEngine({AudioContextCtor:FakeAudioContext});
 assert.equal(await sound.unlock(),true);
 const contextOscillators=sound;
 assert.equal(sound.enabled,true);
 assert.equal(FakeAudioContext.last.oscillators.length,2);
 sound.shot();sound.shot();sound.hit();sound.collect();sound.damage();sound.bossHit();sound.victory();sound.defeat();
 assert.equal(FakeAudioContext.last.oscillators.length,15);
 sound.setEnabled(false);sound.shot();
 assert.equal(FakeAudioContext.last.oscillators.length,15);
 sound.dispose();
});
test('audio engine safely degrades when Web Audio is unavailable',async()=>{
 const sound=createSoundEngine({AudioContextCtor:null});
 assert.equal(await sound.unlock(),false);
 assert.equal(sound.setEnabled(false),false);
 sound.shot();sound.hit();sound.collect();sound.damage();sound.bossHit();sound.victory();sound.defeat();sound.dispose();
 assert.equal(sound.enabled,false);
});
