# Genesis local runtime composition

`createGenesisLocalMind()` composes the local-only runtime loader with the
Portal-compatible inference adapter. It is the orchestration seam from a local
runtime module to `portal.chat.v1`.

The factory returns `ready: true` only after module creation and any runtime
initialization have completed. Failures propagate to the caller. There is no
hosted fallback.

This is not a bundled model, a model downloader, or an implementation of
`generate()`. The runtime module still needs to bind a real local inference
engine and load actual model weights. Until then, tests use a mock runtime and
prove the interfaces connect—not that an LLM is running.

## Test

```sh
node --test genesis-core/local-runtime-composition.test.mjs
```
