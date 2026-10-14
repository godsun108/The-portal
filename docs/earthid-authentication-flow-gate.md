# EarthID local-only authentication flow

This change connects previously merged EarthID components into **one** local-only authentication path. The flow reads a trusted account-bound, active binary WebAuthn credential from SQLite; consumes the one-time challenge; invokes actual `@simplewebauthn/server` cryptographic assertion verification; checks that a verified signature counter can be atomically committed; and only then issues an in-memory session.

The new tests exercise **negative paths** (forged/malformed assertions, replay, wrong account, revoked credential). They prove no session issuance on those paths; they are not successful passkey ceremony tests.

## Trust requirements and remaining blockers
- `accountId` MUST come from trusted, server-controlled authentication ceremony state, **never** from a client-supplied arbitrary account claim. Current challenge tracker accepts a caller-provided account ID and is not yet bound to durable server-side session state.
- The credential registry's `addVerifiedWebAuthnCredential` requires prior trusted verified passkey registration. Complete real enrollment, including safe onboarding, verified public keys and correct initial signature counter, before real use.
- Provide real, signed WebAuthn success fixtures and iPhone passkey integration tests.
- Handle counter compare-and-swap failures, concurrent assertions, zero-counter authenticators, atomic session creation, expiry/revocation, rate limits, account recovery, and persistent challenge/session storage under a reviewed protocol.
- Do not expose this module as a public endpoint or claim functioning account login. All credentials and account IDs used in current tests are synthetic.

Run `npm install --prefix genesis-core --no-package-lock --ignore-scripts` then `node --test genesis-core/authentication-flow.test.mjs` on Node 22+.
