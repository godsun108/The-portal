# EarthID initial signed login over loopback (test-only)

This adds an **explicitly local-only** HTTP fixture for initial login after a verified passkey has already been enrolled. It reuses the existing browser ceremony coordinator, real SimpleWebAuthn signature verifier, challenge store, credential registry and session store.

POST /login/options takes an **untrusted account hint as a lookup key, not proof of identity**. The server-side resolver must return the account and its registered credential identifiers from trusted storage. POST /login/verify accepts only a one-time ceremony handle plus the signed authenticator response: the server resolves the bound account and cryptographically verifies the assertion before issuing a new opaque session as a Secure, HttpOnly, SameSite=Strict cookie. It never returns a bearer token in JSON.

The test exercises success without an existing session; an attempted account substitution cannot change the account receiving the session. Wrong origin, account without a passkey and replay fail closed.

**This is not publicly deployable.** It uses plain HTTP on 127.0.0.1 while simulating a trusted HTTPS Origin in its tests, so browsers will NOT persist Secure cookies in this environment. A public resolver based on account hints would need account-enumeration protection, rate limiting, safe lookup and privacy review; avoid exposing it as-is. Other release gates: independent account-holder proofing, secure HTTPS hosting, account recovery, session fixation prevention, CSRF, durable/atomic ceremony state across workers, audit logging, device and Safari testing, and production security review. No real users, public routes, or deployment are included.
