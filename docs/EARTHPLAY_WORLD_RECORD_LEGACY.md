# EarthPlay World Record Legacy Awards (design + pure planner)
Status: TEST-ONLY PLANNING LIBRARY. No NFT, claim service, EarthID auth, hosted global leaderboard or mint is connected.

When an authenticated player produces a **server-verified** score strictly greater than the current world record for the same game and season, a trusted sequencer can create an immutable *proposed award event*. A later champion does not erase the earlier player's historical award. Ties do not mint duplicates.

The `record-history.mjs` module plans events with unique `gameId:season:serverSequence` IDs and historical records. It is **in-memory** and accepts `authenticatedPlayerId`, `replayVerified` and `serverSequence` from a **trusted backend only**. Browser code must never assert these values. It has no durable consensus, transactions, on-chain ownership or NFT minting. `endedAt` is currently caller supplied, not a trusted server time. No client scores are eligible.

Run `node --test games/starfall/record-history.test.mjs`.

## Intended award lifecycle
1. Trusted server authenticates EarthID, verifies deterministic replay and accepts the score once.
2. Database transaction locks the game-season leader, assigns monotonically increasing sequence and compares strictly higher score.
3. Append a durable unique record event with game/ruleset version, score, UTC server timestamp, pseudonymous player ID, session proof digest, prior champion and privacy-reviewed public display handle.
4. Award registry atomically reserves one claim/mint ID per record event. An outbox worker retries idempotently.
5. Eligible player may claim a non-financial commemorative collectible; if an NFT is eventually enabled, mint only on an approved chain with user consent and clear fees. Transfer policy and wallet rotation must be defined.
6. Historical champion badges remain visible after dethronement; only one *current champion* per game/season.
7. If anti-cheat investigation invalidates a record, issue a visible revocation/correction event. Do not silently erase history.

## Genesis Passport relationship
The Genesis Passport is one welcome collectible per verified wallet; World Record Legacy Awards are separate event-based achievements. Neither is an EarthID login credential or proof of unique personhood. Both require an authoritative durable claim registry before global issuance.

## Safety / launch gates
No personal data or wallet secrets in metadata; no automatic wallet transaction; no client self-mint; no claim of monetary value. Confirm deterministic Starfall replay verification, hosted EarthID, durable transactional leader storage, trusted server clock, event uniqueness, moderation and a tested two-device global scoreboard first.
