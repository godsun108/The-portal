# ASCENSION — campaign build

An original portrait-first 2.5D vertical combat platformer. The four-world campaign is playable from the Gothic Bastion through the Buried Spire, with escalating boss encounters, survival pickups, personal-best ghosts, and hosted friend challenges.

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
- Campaign: four world arcs — Gothic Bastion, Ashen Expanse, Foundry Orbit, The Buried Spire — with boss gates and a final ASCENDED ending.
- Endless Ascension: platform/enemy progression continues beyond the campaign for score and relic records.

## Prototype boundary
- Core campaign and combat are playable in the standalone preview. Hosted friend challenges use the preview API and persistent staging storage.
- The EarthChain Armory is a separate Portal-integrated page that reuses the existing Portal wallet and signed ECTEST commerce coordinator. It is a valueless test-network trial only; no public-chain NFT sale or live-chain mint is enabled.
- ASCENSION's six-item collectible catalogue is defined and metadata-validated. Limited drops remain unavailable until the trusted issuer registers matching metadata and publishes signed offers. Earnable rewards remain disabled until authoritative replay verification and issuer-side deduplication are deployed.
- Final art/audio balance, broader accessibility polish, and hands-on iPhone/desktop playtesting remain before public release.


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

This is a read-only crossover entitlement. The ASCENSION Armory at `market.html` reuses the same Portal wallet and pinned ECTEST coordinator for signed ownership checks and (once the issuer lists canonical ASCENSION drops) signed test purchases. The current catalogue is not itself a mint or listing; no ASCENSION limited drop is purchasable until the issuer registers the exact metadata digest and signs an offer. ASCENSION-native earned collectibles and campaign rewards still require an authoritative game-result verifier and trusted issuer integration; a local score, relic count, or browser save never triggers minting.


## Four-world campaign loop

The playable ascent now has four authored chapter gates across the four environment palettes. Each chapter introduces a named boss with increasing health; automatic fire and pulse combat apply to the boss, and defeating all four opens the ASCENDED victory ending. The chapter HUD shows the current world, seal count, and active boss health. Bosses now fire aimed and spreading projectile volleys, with a faster five-shot second phase below half health. Later campaign bosses attack more frequently. Defeated enemies can drop repair, boost, pulse-reset, and temporary shield pickups; every boss guarantees a repair and shield drop. A shield absorbs one hit and grants a short invulnerability window. The endless climb beyond the fourth chapter is not the campaign completion condition.


## Combat update

- Boss encounters now actively attack instead of serving as stationary health bars. Their projectile spread widens below half health and attack cadence increases across worlds.
- Enemy kills can drop four tactical pickups: repair, boost refill, pulse reset, and temporary shield. Boss defeats guarantee repair and shield drops.
- Combat rules are isolated in `combat.mjs` and covered by unit tests; shield absorption grants a brief hit-protection window to prevent same-frame multi-hit damage.

## Hosted friend links (preview service)

The Node preview service exposes `GET /api/health` as a readiness check, plus `POST /api/challenges` and `GET /api/challenges/:id`. Configure the staging host's HTTP healthcheck to `/api/health`. It validates every submitted replay using the same bounded friend-run schema, returns a random 20-character challenge ID, and makes the run available by URL for up to 24 hours. The browser uses the Web Share sheet when available, copies the URL where clipboard access is available, and retains JSON file export as a fallback.

**Persistence:** challenge records are atomically written to `challenges.json` under `ASCENSION_DATA_DIR` (defaults to `.data`) and reloaded on service start. On Railway, mount a persistent volume at `/data` and set `ASCENSION_DATA_DIR=/data`; without that mounted volume, local container storage may be lost on redeploy. Challenges expire after 24 hours and the store is capped at 1,000 active records. The API applies a request-size limit, bounded per-IP rate tracking, expiry pruning, and rejects invalid samples. This is durable challenge-link storage when backed by a persistent volume, not yet a permanent leaderboard or anti-cheat system. Server-side physics/replay verification, trusted identity, rankings, and signed achievement awards remain production gates.
