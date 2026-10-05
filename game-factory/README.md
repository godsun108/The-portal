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

A generated game must live at `games/<id>/index.html`, be registered in `arcade/cabinets.json`, keep runtime dependencies browser-safe/local, expose PORTAL run telemetry, and pass Game Factory plus Production Experience QA.

## Commands

```bash
node game-factory/game-factory.cjs game-factory/examples/signal-dodge.json
node game-factory/game-factory.cjs --validate
```

`--validate` now checks the existing game catalog and self-tests every factory genre for deterministic output and required integration seams.

Existing games are never overwritten unless a spec explicitly sets `"overwrite": true`.

## Next production stages

Stage 3 adds generated browser playtests and repair evidence. Stage 4 adds richer game-design parameters and VHE actor hooks. Stage 5 can promote proven factory games into larger PORTAL worlds and the future super-app shell.
