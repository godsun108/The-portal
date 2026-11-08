import test from 'node:test';
import assert from 'node:assert/strict';
import {createSoundEngine} from './audio-engine.mjs';
class Param{setValueAtTime(){} exponentialRampToValueAtTime(){} setTargetAtTime(){}}
class Node{constructor(){this.gain=new Param();this.frequency=new Param();this.Q={value:0};this.started=0;}connect(){}start(){this.started++;}stop(){}}
class FakeAudioContext{constructor(){this.currentTime=1;this.state='running';this.destination={};this.oscillators=[];FakeAudioContext.last=this;}createGain(){return new Node();}createOscillator(){const n=new Node();this.oscillators.push(n);return n;}createBiquadFilter(){return new Node();}async resume(){}async close(){}}
test('original soundtrack and distinct weapon, sector, and guardian cues are synthesized offline',async()=>{
 const sound=createSoundEngine({AudioContextCtor:FakeAudioContext});
 assert.equal(await sound.unlock(),true);
 const context=FakeAudioContext.last;
 assert.equal(context.oscillators.length,5,'ambient pad has four voices and one slow filter LFO');
 sound.launch();
 for(const weapon of [0,1,2]){context.currentTime+=.2;sound.shot(weapon);}
 sound.sector(2);sound.guardianPhase(2);sound.guardianVolley();
 sound.hit();sound.collect();sound.damage();sound.bossHit();sound.victory();sound.defeat();
 assert.equal(context.oscillators.length,32);
 sound.setEnabled(false);const mutedCount=context.oscillators.length;sound.shot(0);sound.collect();
 assert.equal(context.oscillators.length,mutedCount,'muting suppresses effects');
 sound.setEnabled(true);sound.dispose();
});
test('audio engine safely degrades when Web Audio is unavailable',async()=>{
 const sound=createSoundEngine({AudioContextCtor:null});
 assert.equal(await sound.unlock(),false);
 assert.equal(sound.setEnabled(false),false);
 sound.launch();sound.shot(0);sound.shot(1);sound.shot(2);sound.sector(1);sound.guardianPhase(3);sound.guardianVolley();sound.hit();sound.collect();sound.damage();sound.bossHit();sound.victory();sound.defeat();sound.dispose();
 assert.equal(sound.enabled,false);
});
