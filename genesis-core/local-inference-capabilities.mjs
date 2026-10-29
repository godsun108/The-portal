/** Read-only browser capability detection; does not initialize inference. */
export function inspectLocalInferenceEnvironment(environment = globalThis) {
  const navigator = environment.navigator ?? {};
  const document = environment.document ?? {};
  const memory = Number.isFinite(navigator.deviceMemory) ? navigator.deviceMemory : null;
  const cores = Number.isInteger(navigator.hardwareConcurrency) && navigator.hardwareConcurrency > 0 ? navigator.hardwareConcurrency : null;
  const webgpu = Boolean(navigator.gpu);
  const wasm = typeof environment.WebAssembly === "object" || typeof environment.WebAssembly === "function";
  const sharedArrayBuffer = typeof environment.SharedArrayBuffer === "function";
  const crossOriginIsolated = environment.crossOriginIsolated === true;
  const indexedDB = Boolean(environment.indexedDB);
  const opfs = typeof navigator.storage?.getDirectory === "function";
  const secureContext = document.isSecureContext === true || environment.isSecureContext === true;
  return Object.freeze({
    secureContext, webgpu, wasm, sharedArrayBuffer, crossOriginIsolated, indexedDB, opfs,
    deviceMemoryGiB: memory, hardwareConcurrency: cores,
    candidates: Object.freeze([...(webgpu ? ["webgpu"] : []), ...(wasm ? ["wasm"] : [])]),
    caveats: Object.freeze([
      "Feature detection does not prove model compatibility or available memory.",
      "Inference requires a separately installed runtime and local model weights.",
      "No network request, model download, or inference is performed."
    ])
  });
}
