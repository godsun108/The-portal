# SOVEREIGN INTELLIGENCE

One intelligence core. Three independent bodies.

## 1. Portal Intelligence
Embedded in The Portal. World-aware, station-aware, bounded discovery, five minds. It receives only explicitly supplied Portal state.

## 2. Online Intelligence
A standalone web/API product with its own identity, memory, tools, authentication, and interface. It does not require Portal to exist.

## 3. Offline Intelligence
A local-first package that can run with networking disabled. Model weights, inference runtime, memory database, embeddings, documents, and UI all live on the user's machine. No cloud dependency is required after installation.

## Ownership ladder

We distinguish ownership honestly:

- **Product-owned:** our code, UX, protocols, memory, tools, datasets, evaluations, deployment.
- **Adaptation-owned:** our adapters/fine-tunes trained on a legally compatible open-weight base.
- **Weight-independent:** an upstream open-weight base can be swapped without rewriting our product.
- **From-scratch weights:** future research milestone requiring our own tokenizer/data/training compute and evaluation. This is not falsely claimed today.

## Shared core contract

All three bodies use a versioned conversation envelope and a model adapter. No UI knows a vendor-specific API.

`SovereignCore.generate({identity, messages, context, tools}) -> {message, actions, provenance}`

Every response carries provenance describing the runtime/model family and whether inference was local or remote. A body must never report itself online/offline or self-trained contrary to its actual runtime.

## Separation

Portal history is not automatically copied into Online AI.
Online AI memory is not automatically copied into Offline AI.
Offline AI makes no network request unless the user deliberately enables an integration.
