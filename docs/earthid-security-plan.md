# EarthID security plan — local-only session primitive

This change introduces a **test-only, in-memory session store**, not a user login system. Sessions use cryptographically random 256-bit bearer tokens, store SHA-256 token digests, enforce expiry and support revocation. The trusted caller must independently verify the account before calling `issue`. The `verified:true` returned by the store is valid only within this isolated trusted-process assumption.

No passkey/WebAuthn registration, login, identity proofing, persistent sessions, recovery, rate limits, anti-phishing protections, email delivery, MFA, cookie transport, CSRF defense, durable session revocation or deployment is included.

## Production requirements
- Use vetted WebAuthn relying-party and credential verification libraries; verify challenge, origin, RP ID, signatures, user presence/verification, counters and replay resistance.
- Store public-key credentials and user/account links in trusted persistent storage. Protect recovery with equivalent rigor and account-change notifications.
- Keep bearer tokens out of browser JavaScript when using web cookie sessions: Secure, HttpOnly, SameSite, limited scope and CSRF defenses.
- Persist only keyed session digests or suitably protected session references, rotate on privilege changes, enforce absolute and idle expirations, provide device logout and server-side revocation.
- Protect endpoints with abuse/rate limits, logging without secrets, security headers, threat modeling and independent review.
- Never deploy these fixtures as a real auth server. No new infrastructure or paid services authorized.

Run `node --test genesis-core/sessions.test.mjs`.
