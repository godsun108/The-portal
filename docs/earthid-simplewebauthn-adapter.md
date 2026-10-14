# EarthID cryptographic verifier adapter

This change wires the real `@simplewebauthn/server` 14.0.3 verification functions into a separate adapter. Tests use the actual library to reject malformed registration and authentication responses. **There is no test of successful passkey login, and no live authentication endpoint.**

Run `npm install --prefix genesis-core --no-package-lock --ignore-scripts` and `node --test genesis-core/simplewebauthn-verifier.test.mjs` on Node 22+. This does not create production accounts or user sessions.

## Integration prerequisites
- Only pass trusted server-owned credential fields `id`, `publicKey: Uint8Array`, `counter` and optional `transports` from an authenticated account's database record. Existing prototype `credentials.mjs` stores an opaque string and requires migration/serialization work before it can supply a real WebAuthn public key.
- Verify expected challenge, HTTPS origin, RP ID and user verification; consume the challenge once and atomically persist the verified new counter before issuing a session.
- Bind registration to an independently authenticated enrollment/onboarding flow. Apply explicit acceptable algorithm, attestation and authenticator policies. Protect logout, recovery, rate limits and session cookies.
- Add end-to-end tests with valid WebAuthn fixture signatures and real passkeys before claiming operational login. No deployment, production secrets or paid infrastructure is approved.
