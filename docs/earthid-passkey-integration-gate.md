# EarthID passkey integration gate

This PR adds **credential metadata storage only**, not passkey registration or authentication. The public-key string is opaque and unverified. Synthetic test keys must never be treated as proof of possession.

Before implementing actual WebAuthn:
1. Select a maintained, vetted WebAuthn server library and confirm supported Node runtime, RP ID, origin and HTTPS requirements.
2. Generate unpredictable one-use challenges server-side, bind to the intended session/account and ceremony type, persist expiration, and consume atomically.
3. Verify authenticator data, challenge, origin, RP ID hash, flags, signature, algorithm, credential public key and counters per the library's documented API. Reject replay and mismatched credentials.
4. Bind credential registration to a previously authenticated account or controlled onboarding flow; enforce unique credential IDs and robust account recovery.
5. Create an application session only after successful verified authentication. Keep recovery, rate limiting, auditing, logout, credential deletion and passkey lifecycle tests in scope.
6. Use platform passkeys on iPhone with a correctly configured HTTPS origin. Never deploy test fixture tokens, synthetic public keys or the registry alone as a login service.

No external provider, production secrets, network endpoint, user accounts or deployment are created by this PR.
