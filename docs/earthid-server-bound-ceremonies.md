# EarthID — local-only server-controlled ceremony context

This patch binds each authentication challenge to a random one-use opaque ceremony handle, purpose, expiration, and **server-selected account ID**. A browser completion call supplies handle, challenge, and response. It does not get to select the account. The handle is consumed on any matching-format attempt, including wrong challenge or ceremony. Both binding and WebAuthn challenge are single-use.

This does **not** establish the trustworthiness of the server selecting an account. Production onboarding must authenticate enrollment or implement a reviewed discoverable-credential account resolution flow. The current `beginAuthentication(trustedAccountId)` is INTERNAL to a trusted process; never expose an endpoint that lets an unauthenticated client choose the account to bind.

Remaining blockers: durable atomic cross-process ceremony storage, DoS and rate limits, correctly protected session cookies and CSRF, persistent account recovery, iPhone/WebAuthn options generation, signup rules, and signed success fixtures for enrollment. In-memory handles are lost on restart and are not a distributed-service implementation.

Test with Node 22 after installing `genesis-core` dependencies:
`node --test genesis-core/bound-authentication.test.mjs`.
