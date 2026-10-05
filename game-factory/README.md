# PORTAL Game Factory

The Game Factory turns a compact game specification into a PORTAL-native game scaffold.

## Contract

A game produced by the factory must:
- live at `games/<id>/index.html`
- import `../protocol.js` and emit `beginRun`, `event`, and `finishRun`
- be registered in `arcade/cabinets.json`
- be playable with keyboard/touch or pointer input
- keep runtime dependencies local/browser-safe
- pass factory validation and PORTAL Production Experience checks

## Pipeline

`spec -> validate -> generate -> register -> browser QA -> publish -> telemetry -> iterate`

The first generator deliberately produces a small deterministic survival game. The architecture is intended to accept additional genre templates without changing the PORTAL contract.

## Usage

```bash
node game-factory/game-factory.cjs game-factory/examples/signal-dodge.json
node game-factory/game-factory.cjs --validate
```

Generation is deterministic. Existing game files are not overwritten unless the specification includes `"overwrite": true`.
