// Sovereign Time Adapter v1
// Normalizes Quantum Clock Lab signals for downstream consumers.
// Relative simulation signals are never promoted to UTC or trusted time.
const INPUT_SCHEMA = "portal.quantum-clock.signal.v1";
const OUTPUT_SCHEMA = "sovereign.time.adapter.v1";
const AUTHORITY = "relative-simulation-only";

function fail(message) {
  return { accepted: false, status: "rejected", error: message, schema: OUTPUT_SCHEMA };
}

function finiteNumber(value, name, { min = -Infinity, exclusiveMin = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(name + " must be a finite number");
  }
  if (exclusiveMin ? value <= min : value < min) {
    throw new RangeError(name + (exclusiveMin ? " must be greater than " : " must be at least ") + min);
  }
  return value;
}

/** Validate the v1 Quantum Clock Lab signal without mutating its input. */
export function validateTimeSignal(signal) {
  const errors = [];
  if (!signal || typeof signal !== "object" || Array.isArray(signal)) {
    return { valid: false, errors: ["signal must be an object"] };
  }
  if (signal.schema !== INPUT_SCHEMA) errors.push("unsupported signal schema");
  if (typeof signal.source !== "string" || !signal.source.trim()) errors.push("source must be a non-empty string");
  for (const [key, options] of [
    ["elapsedSeconds", { min: 0 }],
    ["phaseRad", {}],
    ["estimatedFrequencyOffsetHz", {}],
    ["sampleRateHz", { min: 0, exclusiveMin: true }]
  ]) {
    try { finiteNumber(signal[key], key, options); }
    catch (error) { errors.push(error.message); }
  }
  if (signal.epoch !== null) errors.push("epoch must be null for a relative simulation signal");
  if (signal.timeAuthority !== AUTHORITY) errors.push("timeAuthority must identify a relative simulation");
  if (signal.utcTraceable !== false) errors.push("utcTraceable must be false");
  return { valid: errors.length === 0, errors };
}

/**
 * Adapt a signal to the stable Sovereign consumer contract.
 * transportAgeMs/maxTransportAgeMs are optional caller-supplied monotonic
 * transport measurements; elapsedSeconds is simulation time, not signal age.
 */
export function adaptTimeSignal(signal, {
  requireTrustedAbsoluteTime = false,
  transportAgeMs,
  maxTransportAgeMs
} = {}) {
  const validation = validateTimeSignal(signal);
  if (!validation.valid) return fail(validation.errors.join("; "));
  if (requireTrustedAbsoluteTime) {
    return fail("trusted absolute time required; relative simulation signal cannot satisfy this policy");
  }
  if (maxTransportAgeMs !== undefined) {
    try {
      finiteNumber(maxTransportAgeMs, "maxTransportAgeMs", { min: 0 });
      finiteNumber(transportAgeMs, "transportAgeMs", { min: 0 });
    } catch (error) { return fail(error.message); }
    if (transportAgeMs > maxTransportAgeMs) return fail("signal exceeded the caller-defined transport age limit");
  } else if (transportAgeMs !== undefined) {
    try { finiteNumber(transportAgeMs, "transportAgeMs", { min: 0 }); }
    catch (error) { return fail(error.message); }
  }

  return {
    schema: OUTPUT_SCHEMA,
    version: 1,
    accepted: true,
    status: "valid-relative-signal",
    clock: {
      source: signal.source,
      elapsedSeconds: signal.elapsedSeconds,
      phaseRad: signal.phaseRad,
      estimatedFrequencyOffsetHz: signal.estimatedFrequencyOffsetHz,
      sampleRateHz: signal.sampleRateHz
    },
    authority: {
      kind: "relative",
      reference: "simulation",
      timeAuthority: AUTHORITY,
      absoluteTimeAuthority: false,
      utcTraceable: false,
      epoch: null
    },
    freshness: {
      checked: maxTransportAgeMs !== undefined,
      transportAgeMs: transportAgeMs ?? null,
      maxTransportAgeMs: maxTransportAgeMs ?? null
    }
  };
}

/** Serialize an accepted adapter envelope for local handoff or inspection. */
export function serializeAdaptedTimeSignal(envelope) {
  if (!envelope || envelope.schema !== OUTPUT_SCHEMA || envelope.accepted !== true) {
    throw new TypeError("only an accepted Sovereign time envelope can be serialized");
  }
  return JSON.stringify(envelope, null, 2);
}

export const SOVEREIGN_TIME_ADAPTER_SCHEMA = OUTPUT_SCHEMA;
