# EarthID local HTTP integration test — NOT a public service

Combines existing EarthID session resolution, secure cookie parsing, exact-Origin mutation policy, SQLite persistence and deny-by-default content authorization. Node's HTTP server listens only on an ephemeral 127.0.0.1 port **inside the automated test**. Test code issues two synthetic sessions directly from the trusted session store; there is no login/signup route.

The integration test verifies:
- A valid synthetic session can create/read its private note.
- Cross-origin/missing-Origin mutations are rejected.
- A second synthetic account and anonymous caller cannot retrieve protected bytes.
- Revoked sessions cannot read their former account content.

This is a **local test fixture**, not proof of an operational WebAuthn service. The HTTP test uses a simulated trusted HTTPS Origin header over local loopback; production requires actual HTTPS termination and host/proxy security. No real user accounts, durable session storage, passkey enrollment endpoints, cookie issuance, CSRF tokens, rate limits, account recovery or deployment are implemented. The service is deliberately unstarted until a test explicitly binds it to loopback. Production review and signed real-client ceremonies remain prerequisites.

CI: `node --test genesis-core/local-http-service.test.mjs`.
