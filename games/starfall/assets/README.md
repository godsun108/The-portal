# EarthPlay Starfall — Asset Foundry v0

## Reuse boundary
Authoritative research remains in `godsun108/virtual-human-engine`. Portal's `eidolon-canonical`, `eidolon-studio`, `eidolon-scene-director`, and `reality-foundry` are reusable **research and preview** systems, not evidence of production-ready game assets.

This directory defines a small, deterministic, CPU/browser-friendly ship geometry contract for Fire Horse and Solar Lion. It is a **starting point for interoperability**, not a GLB exporter or 3D integration.

## Planned pipeline
1. Author 3D models in the existing VHE/Eidolon research workflow, in isolated candidate folders.
2. Export original/licensed GLB assets with explicit provenance, mesh units, origin, orientation, rig, and animation metadata.
3. Render fixed-camera transparent sprite sheets (idle, thrust, turn, hit), and export a JSON atlas.
4. Keep Starfall Canvas 2D as the default; load optional sprite atlases only after performance tests and a verified fallback.
5. Benchmark iPhone startup, frame pacing, memory, and expired signed-view behavior. Do not change wallet/ledger code.

## Acceptance gates
- Silhouette is distinct at 32–48 CSS pixels.
- All sprite frames have consistent anchor and collision-neutral bounds.
- Missing/invalid assets fall back to current procedural Canvas ships.
- Rendering remains smooth on iPhone; actual device results required.
- No third-party 3D dependency added to the gameplay runtime.
- Ownership comes only from existing signed ECTEST verification; visual assets confer no ownership.

## Current proof
`ship-contract.mjs` contains two deterministic, validated 2D polygon descriptors. The existing Starfall runtime does **not** import this file yet. No exported GLBs or sprite atlases are claimed.
