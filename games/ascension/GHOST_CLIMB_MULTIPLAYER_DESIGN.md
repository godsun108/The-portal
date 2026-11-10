# ASCENSION — Ghost Climb Multiplayer Design

Status: design specification; implementation has not started.

## Product decision

ASCENSION's first online multiplayer feature is **Ghost Climb**: players share a climb and compete asynchronously, with optional live height updates. It is not real-time co-op combat and does not require both players to be online simultaneously.

The single-player game remains fully playable when offline or when the online service is unavailable.

## Player experience

- A player can start a solo run or join a named/friend challenge.
- During a run, the HUD can show a rival's name, current/best height, and a compact progress marker.
- A translucent ghost warrior can appear in the playfield, replaying another player's recorded movement.
- Ghosts are visual competitors only: they cannot collide with, damage, block, or alter the local player's physics.
- At run end, the player sees their height, relic count, rival comparison, and whether they set a new personal or challenge record.
- Ghost visibility can be toggled for readability and accessibility.

## Delivery phases

### Phase 0 — Preserve the current game

- Keep the current local game loop and controls authoritative for the local player.
- Add no wallet requirement, purchases, tokens, or NFT dependency.
- Keep online features optional and feature-flagged.

### Phase 1 — Recorded ghost runs (first playable online milestone)

1. Record a compact timeline at a fixed sampling rate (target 10–15 samples/second): elapsed milliseconds, world height, horizontal world position, facing/animation state, and selected visual identity.
2. Store a versioned run header: run ID, player display identity, game build/ruleset version, start time, final height, relic count, duration, and integrity/checksum metadata.
3. Upload completed runs to a small game service; do not upload every rendered frame or rely on client-submitted final scores without validation.
4. Download a selected rival run and interpolate between samples for smooth ghost rendering.
5. Normalize replay coordinates against the recorded run's world/camera coordinate system so the ghost remains aligned while the local camera scrolls.
6. Show a ghost label and height delta; discard incompatible replay versions safely.

### Phase 2 — Shared live progress

- A lightweight session service publishes each participant's latest height, run status, and heartbeat.
- Send progress snapshots at a modest cadence (about 2–4 updates/second), not the full physics state.
- Display a rival progress marker/bar and last-updated indicator.
- If a player disconnects, retain their last known position briefly, mark them offline/stale, and continue the local run.
- A live progress marker is not a live ghost. The ghost continues to use a recorded replay until a new recording is available.

### Phase 3 — Social competition

- Private friend challenges and shareable challenge codes.
- Daily/weekly seeded climbs with identical level generation and ruleset versions.
- Leaderboards based on server-validated results.
- Personal best ghosts and a small number of rival ghosts, with player controls for visibility.
- Later: squads, seasonal events, and authored race challenges.

## Technical architecture

### Client

The current browser game remains the renderer and local simulation. Add a multiplayer adapter with a narrow interface:

- recording.start(runMetadata)
- recording.sample(playerSnapshot)
- recording.finish(result)
- ghost.load(runId)
- session.join(challengeCode)
- session.publishProgress(snapshot)
- session.leave()

The adapter must fail closed to local-only play: network errors never pause physics or prevent a run from starting.

### Service

A small HTTPS API is sufficient for Phase 1:
- Create/complete run record.
- Upload and fetch bounded replay payloads.
- Fetch challenge participants and validated best results.
- Enforce payload size, sample count, rate limits, schema versions, and retention limits.

Phase 2 may add WebSocket or server-sent progress updates. Choose only after measuring actual needs; do not introduce a real-time networking stack for the first ghost prototype.

### Data and validation

- Treat every client payload as untrusted.
- Validate monotonic timestamps, coordinate bounds, plausible movement/height, run duration, sample count, and supported build/ruleset.
- Recompute or replay-check results server-side before leaderboard eligibility.
- Keep raw display names constrained and escaped; use stable opaque player IDs.
- Never expose email, account identifiers, device identifiers, or wallet secrets to other players.
- Add report/block controls before broad public discovery.
- Define retention/deletion behavior for recordings and player data.

### Fairness

- Compare runs using the same seeded challenge and ruleset.
- Separate casual ghosts from verified leaderboard submissions.
- Do not let cosmetics change hitboxes, physics, weapon damage, or boost performance.
- Mark stale or incompatible runs instead of silently comparing unlike game versions.

## Suggested HUD

- Top: current height and relic count.
- Side rail: rival's name and compact height/progress bar.
- In-world: one or two translucent ghost warriors, visually distinct from enemies.
- End screen: your height, rival height, difference, and replay option.

Keep the playfield uncluttered on narrow iPhone screens. The progress bar should remain useful even when the ghost is off-screen.

## Audio direction

Create original music and effects. Suggested musical identity: cinematic industrial-electronic, heavy mechanical percussion, low synth pulses, metallic impacts, and a rising rhythmic layer as the player climbs. Give each world its own timbral palette while retaining a recognizable ASCENSION theme. Music and effects should be independently adjustable; include mute and reduced-intensity options. No third-party copyrighted soundtrack samples.

## First implementation acceptance criteria

- A local run starts and completes with no network connection.
- A completed run can be uploaded and fetched by another test account.
- A ghost replays at the correct relative height and horizontal position with smooth interpolation.
- Ghosts never affect collision, bounce, enemy, or score logic.
- Invalid, oversized, stale-version, or implausible replays are rejected or excluded from ranked comparison.
- A network failure never crashes or blocks the local game.
- The iPhone portrait HUD remains readable and touch controls remain unaffected.

## Explicit non-goals for the first milestone

- No direct player-to-player collision or combat.
- No synchronized physics simulation.
- No voice chat or text chat.
- No wallet, NFT, token, marketplace, or paid randomized reward integration.
- No public global leaderboard until result validation and abuse controls exist.
