import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp,lerp,easeOutCubic,frameAt,bankFromDelta,bob} from './animation-engine.mjs';
test('clamping and interpolation remain bounded',()=>{
 assert.equal(clamp(4,0,1),1);assert.equal(lerp(0,10,2),10);assert.equal(easeOutCubic(0),0);assert.equal(easeOutCubic(1),1);
});
test('frame clock wraps deterministically',()=>{
 assert.equal(frameAt(0,8,4),0);assert.equal(frameAt(125,8,4),1);assert.equal(frameAt(500,8,4),0);assert.equal(frameAt(NaN,8,4),0);
});
test('banking never exceeds configured visual limit',()=>{
 assert.ok(Math.abs(bankFromDelta(500,.016))<=.17);
 assert.ok(Math.abs(bankFromDelta(-500,.016))<=.17);
 assert.equal(bankFromDelta(3,0),0);
});
test('bob is periodic and has zero origin',()=>{
 assert.ok(Math.abs(bob(0))<1e-9);assert.ok(Math.abs(bob(1200))<1e-9);
});
