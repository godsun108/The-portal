# Genesis local inference integration status

This branch currently composes a local runtime loader with the Portal chat adapter and reports browser/device primitives.

## What is implemented

- A local runtime module can be loaded from an explicit relative path.
- Runtime initialization must finish before the composed mind is returned.
- The adapter accepts bounded Portal chat messages and calls the runtime's `generate()` function.
- Capability detection reports WebGPU, WebAssembly, SharedArrayBuffer, isolation, storage, and coarse device information.
- CI tests the contracts with mock runtimes.

## What is not implemented

- No concrete inference engine is bundled.
- No model weights are included, downloaded, or loaded.
- No real model generation has been validated.
- Browser capability detection is not a compatibility or memory guarantee.
- `runtimeReady` means the runtime module initialized; it does not mean a model is loaded. `modelLoaded` is true only when a runtime explicitly reports it.

## Next integration gate

Choose and pin a concrete engine that can run fully local model weights in the intended target environment. Then:

1. Verify its licensing, supported hardware/backend, model format, and offline packaging path.
2. Implement a runtime module that binds its real tokenizer/model/generation API to `generate()`.
3. Load weights only from an explicit local asset path; do not add hosted inference or implicit network downloads.
4. Add tests for initialization failure, cancellation, generation, and truthful model-loaded state.
5. Run a small model end-to-end in the target device/browser and record measured memory, startup time, and generation behavior before claiming inference works.

This document is an implementation boundary and checklist, not a claim that a model is running.
