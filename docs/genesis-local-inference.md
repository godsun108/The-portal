# Genesis local inference contract

## Goal

Allow Genesis to run model inference locally or on explicitly self-hosted hardware,
without calling a hosted AI provider. The runtime is an implementation detail behind
a stable contract; Portal's existing `portal.chat.v1` surface remains unchanged.

## Current scope

`genesis-core/local-inference.mjs` defines an adapter around an injected runtime
that implements `generate(request)`. It:

- sends bounded conversation history, selected mind, world context, and optional abort signal;
- validates the generated text before returning the Portal chat response shape;
- performs no fetch, network access, model download, or secret handling;
- makes no claim that an actual model is installed or loaded.

The injected runtime is deliberately not implemented here. This keeps model execution
separate from orchestration and makes tests deterministic.

## Runtime integration stages

1. Select a compatible local inference engine for the target environment (browser
   WebGPU/WASM or a native on-device runtime).
2. Obtain model weights through a user-approved installation flow. Keep weights
   outside the repository when their size or license requires it.
3. Implement the runtime's `generate(request)` method using local execution only.
4. Connect the adapter to the existing Portal Intelligence request path and expose
   explicit states: unavailable, loading, ready, generating, and error.
5. Run offline tests and confirm network requests are absent during inference.

## Safety and truthfulness

- Do not silently fall back to a hosted model.
- Do not mark the runtime ready until the model is actually loaded.
- Do not label arbitrary output as verified. The current `verified: true` field
  is an adapter-level contract compatibility marker, not a guarantee of factual
  correctness or model authenticity; integration must preserve this distinction.
- Tool execution, file writes, publication, purchases, trading, and deployment
  remain separate capabilities governed by Genesis's approval policy.
- Local inference does not imply that the model can modify its own weights,
  improve its intelligence autonomously, or operate beyond the device's hardware.

## Tests

Run with Node's built-in test runner:

```sh
node --test genesis-core/local-inference.test.mjs
```
