# EarthID — verified registration persistence boundary

Local-only enrollment path calling the real SimpleWebAuthn registration verification adapter and persisting the verified credential public key, identifier and initial sign counter to the existing SQLite registry. Challenge is single-use and account/ceremony scoped. Storage is attempted only following `verified: true`.

Current tests cover rejection of malformed actual attestation and counter persistence. **No successful cryptographically signed enrollment fixture, iPhone browser enrollment, trusted account bootstrap, or production endpoint exists.** This is NOT a functioning registration service.

Crucial integration requirement: accountId must come from trusted server-bound onboarding/session state and not client-controlled JSON. Enrollment also needs real registration options generation, explicit RP ID/origin configuration, verified attestation policy, safe credential lifecycle, transports and backup metadata, durable challenges, account recovery and rate limiting.

Do not deploy until successful and rejected signed-ceremony integration tests and an independent security review are complete.
