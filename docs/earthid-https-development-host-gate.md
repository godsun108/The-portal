# EarthID Device Lab — HTTPS hosting gate

October 14, 2026: the iPhone browser verified that Safari offers a secure context and WebAuthn/JSON APIs. The existing GitHub Pages readiness page is **not** a live login, and the repository's local HTTP fixtures are not deployable.

The new `validateDeviceLabOrigin` fail-closed validator enforces a canonical HTTPS origin and a WebAuthn RP ID matching that hostname or a parent registrable hostname. **This is a configuration guard, not an assurance of domain ownership, public-suffix eligibility, TLS, or security review.** Do not deploy merely because it passes.

**Recommended test architecture:** an isolated, single-origin HTTPS EarthID backend serving both its test UI and its API (so browser cookies and passkey origins match), on a reviewed development domain. Do not point the static GitHub Pages page across origins at a private login API. Do not retrofit an existing production service.

**Explicit launch blockers:** independently verified operator-only enrollment, credentials and identities isolated from real users, atomic durable challenge/grant state across restarts and replicas, no account enumeration, rate limits and abuse mitigation, CSRF token or equivalent proof defense for credential-changing operations, HTTP Host/origin/proxy checks, secure cookie transport, device revocation and recovery, durable data backups and auditability. Restrict first access to the intended tester; never expose admin/bootstrap routes over the public internet.

**Operations:** GitHub Actions may run all tests without a laptop or paid GitHub runner changes. Railway services already exist but no deployment, cost, service provisioning, environment variable or networking change is authorized by this PR. Ask for approval of the exact isolated service and cost implications before changing Railway.

**iPhone test:** Once all blockers clear, the real Safari prompt must prove registration, signed login, cookie persistence, logout/revocation and account isolation using a fresh test credential. CI WebAuthn emulation cannot replace that.
