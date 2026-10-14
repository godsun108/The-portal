# EarthID same-service reauthentication HTTP integration

Adds POST /reauth/options and /reauth/verify to the **existing** loopback-only registration API. Both routes require a previously issued, valid test session. The trusted account comes from the server-side session and account lookup. A pending ceremony is bound to that exact session token and to authentication (versus registration), and is consumed once even if the session or ceremony purpose is mismatched. Browser input cannot select an arbitrary account.

Invalid credential response, wrong session, wrong-origin requests, ceremony swapping, replay and revoked-session requests are denied.

**This is not initial login.** The service has no public username/account discovery, secure onboarding, untrusted-client session issuance or production cookie delivery. Successful reauthentication is separately dependent on the existing real WebAuthn signed-authentication fixture and is not tested through this HTTP route. No real users or hosted service are activated.

Follow-on work: demonstrate signed HTTP reauthentication, durable ceremony handles across workers, HTTPS cookies with CSRF tokens, account provisioning, and real iPhone passkeys.
