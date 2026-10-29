# Genesis local runtime loader

This module loads an explicitly configured local runtime module. The module path
must be relative (`./` or `../`); remote and absolute paths are rejected before
the importer is called. A module must export `createRuntime(options)`, which
returns a runtime with `generate(request)`. Optional `initialize()` is awaited
before the loader reports `ready: true`.

The loader does not fetch a model, choose a model, contact a service, or silently
fall back. Runtime implementations are responsible for actually loading model
weights and must surface failures. A module being local is not proof that the
model weights are already available offline; installation and cache policy need
their own explicit design.

## Tests

```sh
node --test genesis-core/local-runtime-loader.test.mjs
```
