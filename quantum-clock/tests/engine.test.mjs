import test from "node:test";
import assert from "node:assert/strict";
import { createClock, advanceClock, simulateRamseyMeasurement, measureClock, synchronizeClocks } from "../engine.mjs";

test("clock advances elapsed time and phase", () => {
  const c = createClock({ id: "a", offsetHz: 0.25 });
  const next = advanceClock(c, 2);
  assert.equal(next.elapsedSeconds, 2);
  assert.ok(Math.abs(next.phaseRad - Math.PI) < 1e-10);
  assert.equal(c.elapsedSeconds, 0, "advanceClock is immutable");
});
test("seeded Ramsey readout is reproducible and bounded", () => {
  const args = { detuningHz: 0.2, interrogationSeconds: 0.5, atomCount: 500, seed: 42 };
  const a = simulateRamseyMeasurement(args), b = simulateRamseyMeasurement(args);
  assert.deepEqual(a, b);
  assert.ok(a.measuredFraction >= 0 && a.measuredFraction <= 1);
  assert.equal(a.atomCount, 500);
});
test("Ramsey contrast and uncertainty respond to atom count", () => {
  const small = simulateRamseyMeasurement({ detuningHz: 0, interrogationSeconds: 1, atomCount: 100, contrast: 0.8 });
  const large = simulateRamseyMeasurement({ detuningHz: 0, interrogationSeconds: 1, atomCount: 400, contrast: 0.8 });
  assert.ok(large.frequencyUncertaintyHz < small.frequencyUncertaintyHz);
  assert.equal(small.probability, 0.9);
});
test("network consensus pulls independent clock estimates toward median", () => {
  const clocks = [createClock({id:"a"}),createClock({id:"b"}),createClock({id:"c"})];
  const measurements = [{clockId:"a",estimatedOffsetHz:0.1},{clockId:"b",estimatedOffsetHz:0.2},{clockId:"c",estimatedOffsetHz:0.8}];
  const result = synchronizeClocks(clocks, measurements, 0.5);
  assert.equal(result.consensusHz, 0.2);
  assert.deepEqual(result.clocks.map(c=>c.correctionHz), [0.05,0,-0.3]);
  assert.equal(result.absoluteTimeAuthority, false);
});
test("invalid physical parameters are rejected", () => {
  assert.throws(() => createClock({id:"x",noiseStdHz:-1}), RangeError);
  assert.throws(() => advanceClock(createClock({id:"x"}), -1), RangeError);
  assert.throws(() => synchronizeClocks([createClock({id:"x"})], [], 0.5), RangeError);
});
