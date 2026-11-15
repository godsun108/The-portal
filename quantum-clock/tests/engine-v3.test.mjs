import test from "node:test";
import assert from "node:assert/strict";
import {createEnvironmentalClock,advanceEnvironmentalClock,createDisciplineController,disciplineClock,allanDeviation,createTimeSignal,serializeTimeSignal} from "../engine-v3.mjs";

test("temperature disturbance changes effective oscillator offset",()=>{
 const c=createEnvironmentalClock({id:"thermal",offsetHz:0.01,referenceTemperatureC:20,temperatureC:20,temperatureCoefficientHzPerC:0.002});
 const warm=advanceEnvironmentalClock(c,10,{temperatureC:25});
 assert.ok(Math.abs(warm.environmentalOffsetHz-0.01)<1e-12);
 assert.equal(warm.temperatureC,25);
 assert.equal(c.temperatureC,20,"source clock remains immutable");
});
test("feedback controller applies bounded correction and retains integral state",()=>{
 const c=createEnvironmentalClock({id:"disc",offsetHz:0.1});
 const controller=createDisciplineController({kp:0.8,ki:0.1,maxCorrectionHz:0.02});
 const a=disciplineClock(c,0.1,controller);
 assert.equal(a.correctionHz,-0.02,"correction is bounded");
 assert.equal(a.controller.updates,1);
 assert.equal(c.correctionHz,0,"source clock remains immutable");
});
test("Allan deviation is computed from adjacent fractional-frequency samples",()=>{
 assert.equal(allanDeviation([1,1,1]),0);
 assert.ok(Math.abs(allanDeviation([0,1,0])-Math.sqrt(0.5))<1e-12);
 assert.equal(allanDeviation([1]),null);
 assert.throws(()=>allanDeviation([0,NaN]),TypeError);
});
test("relative time signal is serializable and never claims UTC authority",()=>{
 const c=createEnvironmentalClock({id:"export",offsetHz:0.01});
 const signal=createTimeSignal({...c,elapsedSeconds:12,phaseRad:1.2,lastOffsetHz:0.011});
 assert.equal(signal.epoch,null);
 assert.equal(signal.utcTraceable,false);
 assert.equal(signal.timeAuthority,"relative-simulation-only");
 assert.equal(JSON.parse(serializeTimeSignal(signal)).source,"export");
});
