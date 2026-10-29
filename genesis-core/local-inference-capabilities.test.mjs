import test from "node:test";
import assert from "node:assert/strict";
import { inspectLocalInferenceEnvironment } from "./local-inference-capabilities.mjs";

test("detects browser primitives without claiming model readiness", () => {
  const env = {
    navigator: { gpu: {}, deviceMemory: 8, hardwareConcurrency: 6, storage: { getDirectory() {} } },
    document: { isSecureContext: true }, WebAssembly: {}, SharedArrayBuffer: class {},
    crossOriginIsolated: true, indexedDB: {}
  };
  const result = inspectLocalInferenceEnvironment(env);
  assert.equal(result.secureContext, true);
  assert.equal(result.webgpu, true);
  assert.equal(result.wasm, true);
  assert.equal(result.sharedArrayBuffer, true);
  assert.equal(result.crossOriginIsolated, true);
  assert.equal(result.indexedDB, true);
  assert.equal(result.opfs, true);
  assert.equal(result.deviceMemoryGiB, 8);
  assert.deepEqual(result.candidates, ["webgpu", "wasm"]);
  assert.ok(result.caveats.some(value => value.includes("does not prove")));
  assert.equal("modelReady" in result, false);
});

test("reports unsupported or minimal environments gracefully", () => {
  const result = inspectLocalInferenceEnvironment({});
  assert.equal(result.webgpu, false);
  assert.equal(result.wasm, false);
  assert.equal(result.secureContext, false);
  assert.equal(result.deviceMemoryGiB, null);
  assert.equal(result.hardwareConcurrency, null);
  assert.deepEqual(result.candidates, []);
});

test("detects WASM independently of WebGPU", () => {
  const result = inspectLocalInferenceEnvironment({ WebAssembly: {} });
  assert.deepEqual(result.candidates, ["wasm"]);
  assert.equal(result.sharedArrayBuffer, false);
  assert.equal(result.crossOriginIsolated, false);
});
