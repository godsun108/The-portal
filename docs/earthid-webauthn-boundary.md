# EarthID WebAuthn integration boundary — not yet authentication

This change provides a testable ceremony orchestration boundary that passes a one-time challenge, expected HTTPS origin, expected RP ID, and mandatory user verification to an **injected verifier**. It rejects cross-account, revoked and mismatched credentials before invoking that verifier, and consumes the challenge before invoking it to prevent replay.

The tests use a **mock verifier** and do NOT exercise cryptographic signature validation, authenticators, browsers, persistent identity, secure credential serialization, counter updates, live passkeys or real sessions. The `verified` result is trustworthy only if a production caller injects an independently vetted verifier and has securely bound onboarding/account context to a verified identity. Never inject a caller-defined function or browser assertion of success.

## Selected library for the next integration
Use maintained `@simplewebauthn/server` (Node 22+) for `verifyRegistrationResponse` and `verifyAuthenticationResponse`. Check the installed library version and run tests with actual valid and invalid WebAuthn fixtures, not mocks. Persist binary credential public keys and counters in a compatible representation and update counters atomically after verification. Proper browser-facing options generation, attestation policy, origin/RP-ID configuration, durable one-time challenges, account recovery and rate limiting remain separate implementation gates.

No npm dependency, public HTTP endpoint, credentials, real sessions, money or deployment is introduced here.

Test: `node --test genesis-core/webauthn-boundary.test.mjs`.
