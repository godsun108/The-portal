# Genesis Autonomous Core

Status: initial deterministic orchestration primitives; **not a complete AI agent**.

## Why this exists
Portal Intelligence currently has a dormant model endpoint contract and browser-local conversation memory. This module adds a model-agnostic, deterministic core for goal records, registered tools, plan validation, execution, evaluation, and memory adapters. It deliberately does not introduce external inference, network access, financial integrations, or production deployment.

## Current capabilities
- Creates a goal/task record.
- Validates plans against registered tools.
- Executes tools sequentially and stops after failure.
- Evaluates tool results before continuing.
- Requires explicit approval for registered consequential capabilities, including trading, spending, public publishing, production deployment, data deletion, and security-policy changes.
- Supports injected memory storage.
- Exposes a capability inventory.

## Important limitation
This is orchestration scaffolding, not independent intelligence. It does not generate plans by itself, contain model weights, train a model, or autonomously improve its own code. A local inference engine and a carefully constrained adapter are future work. Model output must be treated as untrusted input and validated before tools are called.

## Test
From the repository root, run:

```sh
node --test genesis-core/autonomous-core.test.mjs
```
