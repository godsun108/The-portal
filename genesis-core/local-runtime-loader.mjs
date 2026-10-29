function assert(condition, message) {
  if (!condition) throw new TypeError(message);
}

function isLocalModulePath(value) {
  return typeof value === "string" &&
    (value.startsWith("./") || value.startsWith("../")) &&
    !value.includes("\\") &&
    !value.startsWith("//");
}

/**
 * Loads a runtime module from an explicitly local relative path.
 * The module must export createRuntime(options), returning an object with
 * generate(request). No remote fallback is attempted.
 */
export async function loadLocalRuntime({
  modulePath,
  options = {},
  importModule = (path) => import(path)
} = {}) {
  assert(isLocalModulePath(modulePath),
    "runtime module path must be a local relative path (./ or ../).");
  assert(typeof importModule === "function", "importModule must be a function.");

  const imported = await importModule(modulePath);
  assert(imported && typeof imported.createRuntime === "function",
    "local runtime module must export createRuntime(options).");

  const runtime = await imported.createRuntime(options);
  assert(runtime && typeof runtime.generate === "function",
    "created local runtime must expose generate(request).");

  if (typeof runtime.initialize === "function") {
    await runtime.initialize();
  }

  return Object.freeze({
    mode: "local",
    ready: true,
    generate: (request) => runtime.generate(request)
  });
}
