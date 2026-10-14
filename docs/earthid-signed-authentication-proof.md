# EarthID signed WebAuthn authentication proof

This test generates a disposable P-256 authenticator key pair in memory, encodes its public key in COSE EC2 format, signs a WebAuthn-compatible assertion and runs the real SimpleWebAuthn verification library through the existing EarthID flow. It verifies a successful session, persisted signature counter and replay rejection. An independently signed assertion with the wrong origin must fail without a session or counter update.

Run with Node 22 after `npm install --prefix genesis-core --no-package-lock --ignore-scripts`:
`node --test genesis-core/signed-authentication.test.mjs`.

**Scope:** Synthetic keys generated only inside tests. A passing test demonstrates cryptographic verification against the synthetic signed fixture. It does **not** establish real browser passkey enrollment, authenticators on iPhone, trusted server-side account binding, durable sessions, real users, login UI, production deployment, operational recoverability, or full security review. Those remain release blockers.
