# EarthID signed HTTP reauthentication proof

Extends the existing loopback-only passkey reauthentication test to use a **real ES256 cryptographic signature** generated from a disposable test key. The test issues a synthetic preexisting session, creates a trusted server account-linked public key, requests browser options through POST /reauth/options, signs those options, and submits the assertion to POST /reauth/verify.

Checks include successful signature verification through the actual SimpleWebAuthn library, counter advancement, cross-session denial, replay denial, wrong-origin signature denial, and no counter update after denied attempts.

This is **reauthentication for a preauthenticated synthetic account**. It does not prove first-time login or iPhone/WebAuthn browser interoperability. The loopback service has no public HTTPS endpoint or safe account onboarding, and its test-generated sessions must never be exposed as public login credentials. No real user accounts, hosted infrastructure, money or deployment involved.

CI invokes this test via `node --test genesis-core/*.test.mjs`.
