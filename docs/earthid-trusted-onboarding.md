# EarthID trusted onboarding gate (local-only)

Adds a minimal operator-approved account provisioning primitive. A **trusted server operator**, not an anonymous browser, selects the approved account ID before issuing a 256-bit random one-time invitation. Redemption creates only that preselected account through the existing credential registry and consumes the invitation before attempting creation. Expired, malformed, duplicate, and replayed invitations fail closed.

This does **not** authenticate the invite redeemer or authorize passkey enrollment. An invitation secret is not proof of identity and must not be mistaken for a logged-in session. In particular, no public invitation redemption API, registration bootstrap, user identity proofing, email verification, invitation delivery, recovery, or live user lifecycle is implemented.

Invitation state is in memory and must be made durable, atomically consumable, rate-limited, and tied to a strong out-of-band recipient-verification process before a real onboarding service can be launched. The existing protected passkey registration API still requires a verified session.

Tests: `node --test genesis-core/trusted-onboarding.test.mjs`.
