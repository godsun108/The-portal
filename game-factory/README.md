# PORTAL Game Factory

The Game Factory turns a compact specification into a PORTAL-native playable game.

## Production line

`spec -> validate -> genre template -> generate -> register -> structural QA -> browser QA -> publish -> telemetry -> iterate`

Supported Stage-2 genres:
- `survival` — movement + hazard endurance
- `racer` — lane navigation + obstacle survival
- `platformer` — movement/jump + goal traversal
- `puzzle` — deterministic input/sequence challenge
- `strategy` — constrained-resource node control

Every generated game uses the existing PORTAL seams: `beginRun`, `event`, `finishRun`, artifacts, Arcade registration, keyboard/pointer input, and return navigation.

## Contract

A generated game must live at `games/<id>/index.html`, be registered in `arcade/cabinets.json` as a quarantined `candidate`, keep runtime dependencies browser-safe/local, expose PORTAL run telemetry, and pass Game Factory plus Production Experience QA. A factory candidate becomes `playable` only through `promote-candidate.cjs` with explicit passing browser evidence.

## Commands

```bash
node game-factory/game-factory.cjs game-factory/examples/signal-dodge.json
node game-factory/game-factory.cjs --validate\nnode game-factory/acceptance-runner.cjs game-factory/examples/signal-dodge.json\nnode game-factory/promote-candidate.cjs <id> <browser-evidence.json>
```

`--validate` now checks the existing game catalog and self-tests every factory genre for deterministic output and required integration seams.

Existing games are never overwritten unless a spec explicitly sets `"overwrite": true`.

## Next production stages

Stage 3 adds generated browser playtests and repair evidence. Stage 4 adds richer game-design parameters and VHE actor hooks. Stage 5 can promote proven factory games into larger PORTAL worlds and the future super-app shell.

## Production waves

The factory supports batch files under `game-factory/batches/`. CI discovers every batch automatically, generates candidates in an isolated runner, scores structural readiness, builds promotion evidence and a release queue, then browser-tests candidates before any public promotion decision.

Current queued production: Wave 001 (5 candidates) and Wave 002 (10 candidates), plus 5 example/reference specifications.

## Two-track studio model

The volume track deliberately produces many compact original games and lets QA plus player evidence identify winners. The flagship track, PROJECT AEGIS, is protected from volume incentives and advances through premium vertical-slice quality gates.
