# EarthID same-service reauthentication HTTP integration

Adds `POST /reauth/options` and `POST /reauth/verify` to the **loopback-only registration API**. Both routes require a previously issued synthetic test session. The trusted account comes from the server-side session and account lookup. A pending ceremony is bound to that exact session token and to authentication (rather than registration), and is consumed once even if the session or ceremony purpose is mismatched. Browser input cannot select an arbitrary account.

Coverage is split across two tests:

- `genesis-core/loopback-reauth.test.mjs` checks session requirements, origin checks, ceremony-purpose/session binding, invalid credential responses and revoked-session denial.
- `genesis-core/signed-http-reauth.test.mjs` generates a disposable ES256 key and a real signed WebAuthn assertion, then verifies successful reauthentication through the HTTP route, counter advancement, cross-session denial, replay denial, wrong-origin denial and no counter update after denied attempts.

Run the focused tests on Node 22+ with the declared `@simplewebauthn/server` dependency installed:

```sh
node --test genesis-core/loopback-reauth.test.mjs genesis-core/signed-http-reauth.test.mjs
```

**This is not initial login or production authentication.** The successful flow begins with a preauthenticated synthetic account and a test-issued session. The service has no public account discovery, secure first-time onboarding, production session issuance or public HTTPS endpoint. It does not establish iPhone/browser interoperability. Test-generated sessions and fixture keys must never be exposed as public login credentials. No real users or hosted service are activated.

Next gates: build and test an explicit first-time account enrollment/login flow; prove account binding and credential registration with valid signed fixtures; test iPhone passkeys; and review durable challenge/session state, cookie and CSRF protections, recovery, rate limiting, logging and revocation before any production consideration.
