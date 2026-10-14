# EarthID binary WebAuthn public-key persistence

This change expands the **existing** SQLite credential registry without creating a second account system. `addVerifiedWebAuthnCredential` accepts a Uint8Array after a trusted caller has *independently completed and verified* passkey registration. Keys use canonical prefixed base64url storage in the existing public_key TEXT column. `getWebAuthnCredential` retrieves an account-bound, active record with a Uint8Array public key and counter suitable for the SimpleWebAuthn authentication adapter. Opaque legacy synthetic fixture keys cannot be promoted into real credentials.

**Not operational authentication.** The public-key storage method does not validate attestation, signature, origin, challenge, RP ID, account ownership at enrollment, or user verification. A public endpoint must never call it with arbitrary browser data. Existing account IDs are still synthetic. Registration and subsequent authentication must be wired to trusted, reviewed verification and enrollment flows before any session can be issued.

TODO: persist transports, authenticator metadata, verified registration counter and backup flags; transactional registration and counter updates; durable challenge lifecycle and session revocation; successful/failed signed ceremony fixtures; abuse protection; account recovery. No public service, real users or paid infrastructure in scope.

Test: `node --test genesis-core/credential-keys.test.mjs`.
