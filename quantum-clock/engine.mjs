// Quantum Clock Engine v2 — deterministic, browser-safe simulation primitives.
// This is a teaching/emulation model, not a physical clock or trusted time source.
export function seededRandom(seed = 1) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
function gaussian(random) {
  const u1 = Math.max(Number.EPSILON, random());
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite");
  return value;
}
export function createClock({ id, offsetHz = 0, driftHzPerSecond = 0, noiseStdHz = 0, seed = 1 } = {}) {
  if (!id || typeof id !== "string") throw new TypeError("clock id is required");
  for (const [name, value] of Object.entries({ offsetHz, driftHzPerSecond, noiseStdHz })) finite(value, name);
  if (noiseStdHz < 0) throw new RangeError("noiseStdHz cannot be negative");
  return { id, offsetHz, driftHzPerSecond, noiseStdHz, elapsedSeconds: 0, phaseRad: 0, correctionHz: 0, randomState: Number(seed) >>> 0 || 1 };
}
export function advanceClock(clock, seconds) {
  finite(seconds, "seconds");
  if (seconds < 0) throw new RangeError("seconds cannot be negative");
  const random = seededRandom(clock.randomState);
  const startOffset = clock.offsetHz + clock.driftHzPerSecond * clock.elapsedSeconds + clock.correctionHz;
  const endElapsed = clock.elapsedSeconds + seconds;
  const endOffset = clock.offsetHz + clock.driftHzPerSecond * endElapsed + clock.correctionHz + clock.noiseStdHz * gaussian(random);
  const averageOffset = (startOffset + endOffset) / 2;
  return {
    ...clock,
    elapsedSeconds: endElapsed,
    phaseRad: clock.phaseRad + 2 * Math.PI * averageOffset * seconds,
    lastOffsetHz: endOffset,
    randomState: Math.floor(random() * 4294967296) >>> 0
  };
}
export function simulateRamseyMeasurement({ detuningHz, interrogationSeconds, atomCount, contrast = 1, phaseOffsetRad = 0, seed = 1 }) {
  for (const [name, value] of Object.entries({ detuningHz, interrogationSeconds, atomCount, contrast, phaseOffsetRad })) finite(value, name);
  if (interrogationSeconds <= 0 || atomCount < 1 || !Number.isInteger(atomCount)) throw new RangeError("interrogationSeconds and integer atomCount must be positive");
  if (contrast < 0 || contrast > 1) throw new RangeError("contrast must be between 0 and 1");
  const phaseRad = 2 * Math.PI * detuningHz * interrogationSeconds + phaseOffsetRad;
  const probability = Math.min(1, Math.max(0, 0.5 * (1 + contrast * Math.cos(phaseRad))));
  const random = seededRandom(seed);
  let excitedCount = 0;
  for (let i = 0; i < atomCount; i++) if (random() < probability) excitedCount++;
  const measuredFraction = excitedCount / atomCount;
  const frequencyUncertaintyHz = 1 / (2 * Math.PI * interrogationSeconds * contrast * Math.sqrt(atomCount));
  return { phaseRad, probability, excitedCount, atomCount, measuredFraction, frequencyUncertaintyHz };
}
export function measureClock(clock, { interrogationSeconds = 0.5, atomCount = 1000, contrast = 1, seed = 7 } = {}) {
  const trueOffsetHz = clock.offsetHz + clock.driftHzPerSecond * clock.elapsedSeconds + clock.correctionHz;
  const measurement = simulateRamseyMeasurement({
    detuningHz: trueOffsetHz, interrogationSeconds, atomCount, contrast,
    phaseOffsetRad: Math.PI / 2, seed
  });
  const random = seededRandom((Number(seed) ^ clock.randomState) >>> 0);
  const estimatedOffsetHz = trueOffsetHz + gaussian(random) * measurement.frequencyUncertaintyHz;
  return { clockId: clock.id, trueOffsetHz, estimatedOffsetHz, uncertaintyHz: measurement.frequencyUncertaintyHz, measuredFraction: measurement.measuredFraction };
}
export function synchronizeClocks(clocks, measurements, gain = 0.5) {
  finite(gain, "gain");
  if (gain < 0 || gain > 1) throw new RangeError("gain must be between 0 and 1");
  if (!Array.isArray(clocks) || clocks.length < 2) throw new RangeError("at least two clocks are required");
  const values = measurements.map(m => finite(m.estimatedOffsetHz, "estimatedOffsetHz")).sort((a, b) => a - b);
  if (values.length !== clocks.length) throw new RangeError("one measurement per clock is required");
  const mid = Math.floor(values.length / 2);
  const consensusHz = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  const next = clocks.map(clock => {
    const measurement = measurements.find(m => m.clockId === clock.id);
    if (!measurement) throw new Error("missing measurement for " + clock.id);
    const correctionHz = -gain * (measurement.estimatedOffsetHz - consensusHz);
    return { ...clock, correctionHz: clock.correctionHz + correctionHz };
  });
  return { clocks: next, consensusHz, basis: "ensemble-median", absoluteTimeAuthority: false };
}
