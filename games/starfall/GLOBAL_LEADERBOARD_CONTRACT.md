# EarthPlay global leaderboard integration contract (draft v0.1)

Status: DESIGN ONLY. Starfall's personal record is browser-local, editable, and **not** a globally trusted score.

## Existing boundaries
- Starfall game runs in GitHub Pages browser code; gameplay currently uses Math.random and client-side timing.
- EarthID shared authentication and public player handles are not yet verified as connected.
- EarthChain test collectible ownership is separate from Starfall's local game credits and local score.
- Do not publish player emails, private keys, wallet secrets, or real-world identity.

## Proposed authoritative service
1. Issue a short-lived authenticated play session with server-created nonce, game version, and expiration.
2. Server validates deterministic gameplay event log/replay or runs authoritative simulation; **never trust a client-submitted score alone**.
3. Accept an idempotent submission (session ID + result digest) once; reject replays, stale versions, and impossible results.
4. Store best scores keyed by pseudonymous EarthID public handle + game ID + ruleset + season; allow handle rotation and deletion policy.
5. Expose a paginated read-only standings API and WebSocket/SSE update stream; polling with ETags is a fallback.
6. Sign or hash milestone achievements for optional EarthChain anchoring; do not write each raw score or personal data on chain.

### Candidate endpoints (NOT IMPLEMENTED)
- POST /v1/earthplay/sessions
- POST /v1/earthplay/results
- GET /v1/earthplay/leaderboards/{gameId}?season=...
- GET /v1/earthplay/leaderboards/{gameId}/events

### Required gates before public global rankings
- Identify and verify existing EarthID auth contract and hosted backend owner.
- Define server-side score validation; current Starfall randomness is not deterministic.
- Add rate limits, moderation, replay testing, and privacy retention.
- Demonstrate cross-device sync with two independent sessions and audit invalid scores.
- Preserve zero-new-spend policy; no service is provisioned by this document.
