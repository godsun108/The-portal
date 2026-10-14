# EarthID durable session persistence — local-only

This change adds `createDurableSessionStore` using SQLite and 256-bit random bearer tokens. The database stores only SHA-256 token hashes, account IDs and absolute expiration timestamps. Lookup, expiry, single-session revocation, account-wide revocation and expiry pruning are backed by SQLite. Test coverage includes reopening the database, checking that the raw token does not appear in the database file, revocation and protected HTTP resource access.

The API shape matches the existing `sessions.resolve()` contract. Do not issue sessions except after a *verified* WebAuthn login or a separately reviewed strong authentication/recovery flow. This module cannot verify credentials by itself.

**Not production-ready:** no session issuance endpoint, encryption-at-rest solution, operational backup protection, device inventory, idle timeout/rotation, cookie+CSRF endpoint integration, migration and deployment policy, rate limits, tamper detection or multi-instance operational tests. No real users or hosted service are activated.

Run `node --test genesis-core/durable-sessions.test.mjs`. CI runs this alongside the other Genesis Core tests.
