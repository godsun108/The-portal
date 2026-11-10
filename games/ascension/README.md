# ASCENSION — prototype brief

An original portrait-first 2.5D vertical combat platformer. This first playable slice establishes the movement and combat feel before campaign scope expands.

## Creative identity
- Original grimdark science-fiction universe; no borrowed Warhammer names, factions, characters, iconography, or designs.
- Protagonist: compact heavy armored warrior; matte black armor, aged bronze plates, amber visor, twin-thruster pack.
- Mood: solemn, monumental, mysterious; readable arcade action in the foreground.
- Visual depth: layered parallax silhouettes, atmospheric haze, distant gothic-industrial towers, bronze-lit platforms.

## Core loop
1. Steer horizontally by dragging anywhere in the playfield.
2. Land on platforms to bounce automatically.
3. Hold Jet Boost for a limited upward thrust, then let its meter recharge.
4. Weapon fires automatically upward at hostile targets.
5. Tap Pulse for a cooldown-gated area clear.
6. Climb for distance, gather relics, and survive increasingly dense threats.

## Modes planned
- Endless Ascension: endless platform/enemy progression, score and relic record.
- Campaign: four world arcs — Gothic Bastion, Ashen Expanse, Foundry Orbit, The Buried Spire — each with authored encounters, a boss, and story fragments.

## Prototype boundary
- Local-only game state; no wallet, purchases, multiplayer claims, external assets, or external runtime dependencies.
- This is a mechanics and visual-direction slice, not the complete campaign or final art.
- Touch behavior must be tested on iPhone before promoting or cataloguing as live.


## Ghost Climb prototype status

- Local best-run ghost replay is implemented as the first visual prototype.
- The game records compact timestamped height and normalized horizontal-position samples during a run.
- A new personal height record is saved in browser local storage; later runs replay it as a translucent, non-colliding warrior and show a height comparison strip.
- Replay data is schema-versioned, bounded, and validated before playback. Storage failures safely fall back to ordinary solo play.
- This is **local personal-best ghost playback only**. It is not yet online, does not yet show another player's run, and does not synchronize live progress.
- Next milestones: export/import or service-backed run sharing, then friend challenges and live progress updates.
