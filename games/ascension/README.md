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
- Portable friend-run sharing is now implemented as a versioned JSON replay file. Players can export a completed climb and send it to a friend; the friend can import it and race a translucent, non-colliding ghost.
- Imported runs are size-bounded and validated for schema, sample count, monotonic timestamps, plausible height, and normalized horizontal coordinates.
- Sharing is currently file-based and works across devices without a game account or network service. It is not yet server-hosted multiplayer, a ranked leaderboard, or on-chain achievement issuance.
- Next milestones: hosted friend challenges with server-side replay validation, then read-only EarthChain test-wallet proof and independently verified test collectibles.


## EarthChain / Starfall crossover

ASCENSION reuses the existing Portal Starfall EarthChain test-wallet session and its pinned, signed ownership projection. It does not create another wallet or issue tokens from game code. When the same browser has a fresh verified Starfall ownership view, approved Starfall cosmetics can appear as ASCENSION-only visual armor treatments. The proof is short-lived; missing, expired, wrong-network, or invalid proof falls back to standard armor. Open the existing Starfall wallet checkout from the ASCENSION intro to connect or refresh the existing wallet session.

This is a read-only crossover entitlement. ASCENSION-native earned collectibles and campaign rewards still require an authoritative game-result verifier and trusted issuer integration; a local score, relic count, or browser save never triggers minting.


## Four-world campaign loop

The playable ascent now has four authored chapter gates across the four environment palettes. Each chapter introduces a named boss with increasing health; automatic fire and pulse combat apply to the boss, and defeating all four opens the ASCENDED victory ending. The chapter HUD shows the current world, seal count, and active boss health. The endless climb beyond the fourth chapter is not the campaign completion condition.


## Hosted friend links (preview service)

The Node preview service exposes `POST /api/challenges` and `GET /api/challenges/:id`. It validates every submitted replay using the same bounded friend-run schema, returns a random 20-character challenge ID, and makes the run available by URL for up to 24 hours. The browser uses the Web Share sheet when available, copies the URL where clipboard access is available, and retains JSON file export as a fallback.

**Preview limitation:** challenge records currently live in the service process memory. They are not durable across a service restart/redeploy and are not a permanent leaderboard. The API applies a request-size limit, basic per-IP rate limit, record cap, expiry pruning, and rejects invalid samples. Durable challenges, player identity, anti-cheat replay simulation, rankings, and signed achievement awards require persistent storage and server-side verification before production.
