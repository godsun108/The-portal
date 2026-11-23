import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptTimeSignal, validateTimeSignal, serializeAdaptedTimeSignal,
  SOVEREIGN_TIME_ADAPTER_SCHEMA
} from "../sovereign-time-adapter.mjs";

const signal = () => ({
  schema: "portal.quantum-clock.signal.v1",
  source: "clock-a",
  elapsedSeconds: 12.5,
  phaseRad: 0.75,
  estimatedFrequencyOffsetHz: -0.0002,
  sampleRateHz: 1,
  epoch: null,
  timeAuthority: "relative-simulation-only",
  utcTraceable: false
});

test("accepts and normalizes a valid relative signal", () => {
  const result = adaptTimeSignal(signal());
  assert.equal(result.accepted, true);
  assert.equal(result.schema, SOVEREIGN_TIME_ADAPTER_SCHEMA);
  assert.equal(result.authority.absoluteTimeAuthority, false);
  assert.equal(result.authority.utcTraceable, false);
  assert.equal(result.clock.elapsedSeconds, 12.5);
});

test("validation rejects malformed objects and unsupported schemas", () => {
  assert.equal(validateTimeSignal(null).valid, false);
  const bad = signal(); bad.schema = "other.v9";
  assert.equal(adaptTimeSignal(bad).accepted, false);
});

test("rejects invalid numeric values and missing source", () => {
  for (const [key, value] of [["elapsedSeconds", -1], ["phaseRad", NaN],
    ["estimatedFrequencyOffsetHz", Infinity], ["sampleRateHz", 0], ["source", " "]]) {
    const bad = signal(); bad[key] = value;
    assert.equal(adaptTimeSignal(bad).accepted, false, key);
  }
});

test("refuses forged UTC or absolute-time claims", () => {
  for (const [key, value] of [["epoch", 1730000000],
    ["timeAuthority", "utc"], ["utcTraceable", true]]) {
    const bad = signal(); bad[key] = value;
    assert.equal(adaptTimeSignal(bad).accepted, false, key);
  }
});

test("trusted absolute time policy rejects relative-only source", () => {
  const result = adaptTimeSignal(signal(), { requireTrustedAbsoluteTime: true });
  assert.equal(result.accepted, false);
  assert.match(result.error, /trusted absolute time required/);
});

test("caller-supplied transport age policy rejects stale handoffs", () => {
  assert.equal(adaptTimeSignal(signal(), { transportAgeMs: 80, maxTransportAgeMs: 100 }).accepted, true);
  assert.equal(adaptTimeSignal(signal(), { transportAgeMs: 101, maxTransportAgeMs: 100 }).accepted, false);
  assert.equal(adaptTimeSignal(signal(), { maxTransportAgeMs: 100 }).accepted, false);
});

test("does not mutate source and serializes only accepted envelopes", () => {
  const original = signal();
  const before = JSON.stringify(original);
  const envelope = adaptTimeSignal(original);
  assert.equal(JSON.stringify(original), before);
  assert.match(serializeAdaptedTimeSignal(envelope), /valid-relative-signal/);
  assert.throws(() => serializeAdaptedTimeSignal({ accepted: false }), /only an accepted/);
});
