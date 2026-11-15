// Quantum Clock Engine v3 — environmental disturbance, feedback discipline,
// stability analysis, and exportable relative time signals.
// Teaching/emulation only: no physical atom, UTC traceability, or trusted authority.
import { createClock, advanceClock } from "./engine.mjs";

const finite = (v, n) => {
  if (!Number.isFinite(v)) throw new TypeError(n + " must be finite");
  return v;
};
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function createEnvironmentalClock({ referenceTemperatureC = 20, temperatureC = 20,
  temperatureCoefficientHzPerC = 0, ...clockOptions } = {}) {
  for (const [n,v] of Object.entries({referenceTemperatureC,temperatureC,temperatureCoefficientHzPerC})) finite(v,n);
  return {
    ...createClock(clockOptions),
    referenceTemperatureC, temperatureC, temperatureCoefficientHzPerC,
    environmentalOffsetHz: (temperatureC-referenceTemperatureC)*temperatureCoefficientHzPerC
  };
}

export function advanceEnvironmentalClock(clock, seconds, { temperatureC = clock.temperatureC } = {}) {
  finite(temperatureC,"temperatureC");
  const environmentalOffsetHz = (temperatureC-clock.referenceTemperatureC)*clock.temperatureCoefficientHzPerC;
  const adjusted = {...clock, offsetHz: clock.offsetHz+environmentalOffsetHz};
  const advanced = advanceClock(adjusted,seconds);
  return {...advanced, offsetHz:clock.offsetHz, temperatureC,
    environmentalOffsetHz, effectiveOffsetHz:advanced.lastOffsetHz};
}

export function createDisciplineController({kp=0.65,ki=0.08,maxCorrectionHz=0.02}={}) {
  for(const [n,v] of Object.entries({kp,ki,maxCorrectionHz})) finite(v,n);
  if(kp<0||ki<0||maxCorrectionHz<=0) throw new RangeError("controller gains must be nonnegative and correction limit positive");
  return {kp,ki,maxCorrectionHz,integralHz:0,updates:0};
}

export function disciplineClock(clock, measuredOffsetHz, controller) {
  finite(measuredOffsetHz,"measuredOffsetHz");
  const integralHz=controller.integralHz+measuredOffsetHz;
  const requested=-(controller.kp*measuredOffsetHz+controller.ki*integralHz);
  const correctionHz=clamp(requested,-controller.maxCorrectionHz,controller.maxCorrectionHz);
  const nextController={...controller,integralHz,updates:controller.updates+1};
  return {
    clock:{...clock,correctionHz:clock.correctionHz+correctionHz},
    controller:nextController,
    correctionHz,
    residualEstimateHz:measuredOffsetHz+correctionHz
  };
}

// Non-overlapping Allan deviation from equally spaced fractional-frequency samples.
// Returns null when fewer than two samples are supplied.
export function allanDeviation(samples) {
  if(!Array.isArray(samples)) throw new TypeError("samples must be an array");
  samples.forEach((v,i)=>finite(v,"samples["+i+"]"));
  if(samples.length<2) return null;
  let sum=0;
  for(let i=0;i<samples.length-1;i++){const d=samples[i+1]-samples[i];sum+=d*d;}
  return Math.sqrt(sum/(2*(samples.length-1)));
}

// Export a relative time signal. epoch is intentionally null: this is not UTC.
export function createTimeSignal(clock,{sampleRateHz=1,label=clock.id}={}) {
  finite(sampleRateHz,"sampleRateHz");
  if(sampleRateHz<=0) throw new RangeError("sampleRateHz must be positive");
  return {
    schema:"portal.quantum-clock.signal.v1",
    source:label,
    elapsedSeconds:clock.elapsedSeconds,
    phaseRad:clock.phaseRad,
    estimatedFrequencyOffsetHz:clock.lastOffsetHz ?? clock.offsetHz+clock.correctionHz,
    sampleRateHz,
    epoch:null,
    timeAuthority:"relative-simulation-only",
    utcTraceable:false
  };
}
export function serializeTimeSignal(signal) {
  return JSON.stringify(signal,null,2);
}
