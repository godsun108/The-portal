# Sovereign Time Adapter v1

The adapter is the first stable boundary between the Portal Quantum Clock Lab and future Sovereign consumers (Genesis, EarthChain, and Portal).

## Contract

- Input: `portal.quantum-clock.signal.v1`, emitted by `createTimeSignal` in `engine-v3.mjs`.
- Output: `sovereign.time.adapter.v1`, version 1.
- A valid input must have a non-empty source, finite numeric measurements, non-negative elapsed simulation seconds, a positive sample rate, `epoch: null`, `timeAuthority: "relative-simulation-only"`, and `utcTraceable: false`.
- The adapter copies only known fields into its output and does not mutate the input.
- Invalid, unsupported, or policy-incompatible signals are rejected with a stable status and error.
- `requireTrustedAbsoluteTime` rejects this relative-only source. No trusted absolute-time provider is implemented by this change.

## Freshness

The signal's `elapsedSeconds` is simulation elapsed time; it is not wall-clock age. The adapter therefore does not infer staleness from it. A caller may provide `transportAgeMs` and `maxTransportAgeMs` measured by a suitable monotonic transport layer. When a maximum is requested, missing or invalid age metadata causes rejection.

## Example

```js
import { createTimeSignal } from "./engine-v3.mjs";
import { adaptTimeSignal } from "./sovereign-time-adapter.mjs";

const raw = createTimeSignal(clock, { label: "portal-lab-clock" });
const handoff = adaptTimeSignal(raw);
if (handoff.accepted) {
  // Consumers may use relative phase/frequency data only.
  // Do not use this envelope as UTC or for security deadlines.
}
```

## Safety boundary

This is a software interface and schema-validation layer, not a clock, time server, consensus authority, secure timestamping service, or UTC-traceable source. Consensus among simulated clocks cannot create absolute time authority. Genesis, EarthChain, and Portal are not wired to consume this adapter by this PR; the adapter establishes a tested integration contract for later work.
