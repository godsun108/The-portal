import { createLocalInference } from "./local-inference.mjs";
import { loadLocalRuntime } from "./local-runtime-loader.mjs";

/**
 * Loads a local runtime and binds it to the Portal-compatible inference adapter.
 * This composes existing contracts; it does not provide a model implementation.
 */
export async function createGenesisLocalMind({
  modulePath,
  runtimeOptions = {},
  importModule,
  mind = "portal",
  maxMessages = 20
} = {}) {
  const runtime = await loadLocalRuntime({
    modulePath,
    options: runtimeOptions,
    ...(importModule ? { importModule } : {})
  });
  const inference = createLocalInference({ runtime, mind, maxMessages });

  return Object.freeze({
    mode: "local",
    ready: true,
    respond: (request) => inference.respond(request)
  });
}
