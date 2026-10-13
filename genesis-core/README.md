# Genesis Core — local database prototype

This is **not a public authentication service**. It uses synthetic fixed test tokens and a local SQLite database to exercise server-owned resource persistence and access control. Never deploy this prototype to the internet.

Requires Node.js 22.5+ with built-in `node:sqlite` available. No npm dependencies.

Run tests: `node --test genesis-core/core.test.mjs`.

Next milestones: vetted WebAuthn/passkey implementation, hardened sessions, trusted account provisioning, migration system, audit events, secure backups, rate limits and a security review before any public exposure. Production code must never trust fixture tokens.
