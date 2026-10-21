# EarthPlay Ranking Engine — v1

This is an **isolated, pure, in-memory ranking library**, not a deployed worldwide leaderboard.

## Verified integration boundary
- `ranking-engine.mjs` validates score result shapes, enforces one result per session, tracks player best, sorts standings deterministically, and rejects submissions without the trusted caller asserting authenticated identity and verified replay.
- `ranking-engine.test.mjs` exercises tie-breaking, best scores, duplicate sessions, impersonation, and invalid scores.
- Assertions `authenticatedPlayerId` and `replayVerified` are **trusted-server inputs**. The library cannot establish them. Never expose `accept` directly as an unauthenticated HTTP endpoint or set `replayVerified: true` based on a browser request.
- The current Starfall client is nondeterministic and its local personal records are untrusted. A replay verifier and real EarthID login are prerequisites.
- In-memory data is lost on restart. Shared durable storage, event fanout, anti-cheat, and deployment are still required for cross-device rankings.

Run: `node --test games/starfall/ranking-engine.test.mjs`

Next: locate an authorized existing hosted backend, implement a deterministic Starfall simulation and server replay verifier, then wire EarthID authenticated public player IDs to durable leaderboard storage. No new infrastructure or spending authorized.
