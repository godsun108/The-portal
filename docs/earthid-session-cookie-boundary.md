# EarthID secure browser session-cookie transport

The session cookie helper provides a restricted `__Host-` cookie with Secure, HttpOnly, SameSite=Strict, Path=/ and bounded Max-Age. No browser JavaScript needs the bearer token. The parser rejects duplicate, malformed and oversized cookie headers. The logout cookie clears the browser reference.

**Not a complete production session implementation.** These are pure header helpers; no server, cookies, real authentication, or deployment is enabled. Production use requires HTTPS-only origin, trusted session issuance after verified passkey login, durable server-side session revocation/expiry, logout that revokes server-side credentials, session rotation and account recovery. Cookie-authenticated state-changing requests must enforce CSRF defenses and Origin/Fetch Metadata checks, even with SameSite protection. Avoid logging cookie header values.

Run `node --test genesis-core/session-cookie.test.mjs`.
