import { createLocalInference } from "./local-inference.mjs";
import { loadLocalRuntime } from "./local-runtime-loader.mjs";
import { inspectLocalInferenceEnvironment } from "./local-inference-capabilities.mjs";

/**
 * Loads a local runtime and binds it to the Portal-compatible inference adapter.
 * This composes contracts; it does not supply an engine or model weights.
 */
export async function createGenesisLocalMind({
  modulePath,
  runtimeOptions = {},
  importModule,
  mind = "portal",
  maxMessages = 20,
  environment = globalThis
} = {}) {
  const capabilities = inspectLocalInferenceEnvironment(environment);
  const runtime = await loadLocalRuntime({
    modulePath,
    options: runtimeOptions,
    ...(importModule ? { importModule } : {})
  });
  const inference = createLocalInference({ runtime, mind, maxMessages });

  return Object.freeze({
    mode: "local",
    runtimeReady: true,
    modelLoaded: runtime.modelLoaded === true,
    capabilities,
    respond: (request) => inference.respond(request)
  });
}
