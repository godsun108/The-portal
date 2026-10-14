# EarthID verified authentication counter persistence

The credential registry now exposes `commitVerifiedCounter({id,accountId,previousCounter,newCounter})` as an internal storage operation. It atomically checks credential identity, ownership, revocation and the stored prior counter, then conditionally updates the counter. Stale concurrent writes fail closed. The exception for 0-to-0 matches authenticators that do not advance counters.

**Do not call this operation in response to an unverified browser request.** It requires a separate, vetted WebAuthn library to have verified the signature, challenge, RP ID, origin, credential identity and user verification. Counter persistence by itself is NOT authentication. There is currently no real login service or public endpoint. Caller must link verification and counter updates to secure session issuance using a reviewed transaction/race policy.

Tests: `node --test genesis-core/counters.test.mjs`.
