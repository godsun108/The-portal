# Genesis / EarthID account recovery — design and acceptance criteria

## Status

Design only. This document does **not** implement account recovery, production identity, or an account-access bypass. The current EarthID code is a local integration prototype.

## Security objective

Restore account access after a lost, unavailable, or revoked authenticator without allowing a caller to choose an account subject, reset credentials, or receive a session based only on untrusted profile data, device labels, email claims, or possession of a client-supplied device ID.

Recovery must be an independently authenticated, auditable ceremony. Recovery cannot be treated as proof that a physical device is genuine.

## Required ceremony

1. **Start recovery** using a server-generated opaque recovery transaction ID and a short-lived challenge. Do not issue a session or disclose whether an arbitrary account identifier exists.
2. **Verify recovery authority** using a recovery method established before the loss event and bound to the account. The verifier must be server-side and cryptographically checkable. Do not accept a request-body subject as trusted identity.
3. **Apply recovery policy** with a documented threshold and cooling-off policy for high-risk changes. Any notification or waiting period must not itself count as identity proof.
4. **Commit atomically**: consume the recovery proof exactly once; invalidate the affected credential(s) and sessions as required; record the recovery event; and create a narrowly scoped recovery authorization. Replays and concurrent redemption must fail.
5. **Re-enroll** a new authenticator through the normal WebAuthn registration ceremony, using the scoped authorization, not a direct credential insertion.
6. **Complete** only after successful re-enrollment. Issue a normal session through the existing verified authentication boundary. Recovery authorization must expire and must not become a bearer login token.
7. **Notify and audit** through trusted channels, with minimal sensitive data and no recovery secrets in logs. Provide a way to revoke/abort pending recovery after independently authenticated account access is restored.

## Data and transaction requirements

- Store recovery verifier material only as a strong hash/HMAC or other reviewed verifier; never store or log plaintext recovery secrets.
- Generate high-entropy, single-use recovery secrets server-side. Display them only at provisioning and make the user explicitly acknowledge secure storage.
- Bind recovery records to a stable trusted account ID, purpose, expiry, and state.
- Use one database transaction (or a carefully specified cross-store protocol) for redemption, proof consumption, credential/session revocation, and audit state changes.
- Enforce uniqueness/atomic state transitions to prevent replay and race conditions across connections.
- Recovery tokens must be scoped to a recovery transaction and operation, expire quickly, and never authorize arbitrary sessions or account changes.
- Fail closed on missing schema, invalid state, transaction failure, expired proof, or policy mismatch.

## Abuse cases and required tests

- Wrong account, wrong proof, expired proof, revoked proof, and malformed transaction.
- Same proof redeemed twice, including simultaneous attempts through separate DB connections.
- Recovery proof replay after completion, abort, or expiry.
- Attempt to pass subject/account ID from an untrusted request body.
- Attempt to issue a session directly from recovery without normal re-enrollment.
- Attempt to enroll a credential while recovery proof is expired or used.
- Lost authenticator with no pre-established recovery authority: deny automated recovery; require a separately designed, high-assurance manual process rather than weakening authentication.
- Recovery while device cap is reached: explicit policy; never silently bypass the cap.
- Credential/session revocation and audit write failure: transaction rolls back or fails closed.

## Production gate — not yet met

Before production use, review and implement:
- Server-side ceremony endpoints and trusted account/session binding.
- CSRF, origin, rate limiting, abuse detection, generic responses, and safe error handling.
- Recovery enrollment and user-facing secure secret handling.
- Secure storage, backup/restore, key rotation, database permissions, audit retention, and operational incident response.
- Independent security review and end-to-end integration tests.
- Account lifecycle, notifications, accessibility, and recovery support procedures.

## Explicit non-goals

- A client-supplied device ID is not recovery proof.
- A synced passkey's presence is not proof of one physical device.
- Email/SMS notification alone is not strong recovery authority.
- A recovery flow must not bypass WebAuthn verification or directly mint a durable session.
