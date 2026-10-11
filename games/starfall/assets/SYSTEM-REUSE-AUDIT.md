# Cross-system reuse audit — 2026-10-11

## Verified from repository documentation
| Source | Existing capability | Reuse opportunity | Boundary |
|---|---|---|---|
| `eidolon-canonical` | Python scripts generate canonical and experimental rigged GLBs; GLB header/chunk checks; Three.js GLTFLoader preview | Reuse mesh-export validation and browser import checks for a new ship model pipeline | Human rigging/locomotion not yet iPhone-certified; not a ship asset exporter |
| `reality-foundry` | Browser-native Canvas wireframe, timeline, rotation/zoom, explode and visibility controls | Reuse UI patterns for an isolated ship preview/inspector | Conceptual geometry; not CAD-grade or production game asset |
| `virtual-human-engine` | Fictional character profiles, deterministic content briefs, continuity/disclosure and human approval queue (README v0.1) | Reuse provenance and human approval principles for game/media asset publishing | README does not establish a completed 3D game asset export pipeline |
| `games/starfall` | Working Canvas game, two visual hull renderers and signed ECTEST hull verification | Preserve as mobile fallback and test harness | Do not modify wallet, coordinator, ownership or local game credits |

## Repository discovery (not capability verification)
Other candidate repos for later targeted inspection: `edge-intelligence`, `Sovereign-Core`, `turbo-foundry`, `Command-center`, `earth-now`, `victorychain_stack`. Presence alone does not imply graphics/asset functionality.

## Integration order
1. Reuse the canonical GLB structural checks in an isolated Starfall model experiment.
2. Adapt Reality Foundry's Canvas inspection UI to preview 2D ship geometry and animation timing.
3. Introduce an explicit asset manifest: creator/provenance, license, SHA-256, dimensions, anchor, animation FPS, file size and fallback ID.
4. Only then build GLB → transparent sprite-atlas conversion. Keep rendering in the existing Canvas game.
5. Benchmark and visually inspect on iPhone before wiring assets into Starfall.

## Constraints
No duplication of wallet logic; no new runtime dependency or paid infrastructure without justification; no production deployment from this audit; never treat research prototypes as validated game assets.
