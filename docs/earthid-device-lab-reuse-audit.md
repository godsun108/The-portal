# EarthID Device Lab — existing infrastructure reuse audit

October 14, 2026. The following are **inspected existing resources**, not new deployments:

- GitHub repository `godsun108/The-portal` already contains EarthID verified registration/authentication, local HTTP tests, signed assertions, SQLite credentials/sessions, and browser integration.
- Railway **Genesis First Contact Alpha** has an existing successful `genesis-first-contact` deployment sourced from `godsun108/Sovereign-Core`, with a Railway HTTPS domain and access-key configuration.
- Railway **Genesis First Contact Alpha** also has a successfully deployed `shared-reality-relay` sourced from `godsun108/The-portal`.
- Railway **EarthChain Preview** has existing private preview, disposable test relay, device trial and checkout services. Some services are sleeping; **none is verified to be a ready-made EarthID authentication server**.
- GitHub Pages hosts static preview files and is not an authentication verifier, data store, or private HTTPS API.

## This pull request

Adds a mobile-first **read-only Device Lab page** and a separate GitHub Actions workflow that runs the *existing cryptographic and HTTP test suite*. Browser registration and sign-in controls remain disabled. CI emulates the authenticator cryptography and local server interactions; this does **not** emulate iOS Secure Enclave, Safari UI, a real device, or biometric prompt.

## Next release gates (not done here)

1. Security review of an isolated dedicated EarthID service, with durable atomic challenge/enrollment state, authenticated operator enrollment and safe recovery.
2. Abuse/rate-limit and account-enumeration safeguards, CSRF, session fixation protections and server origin/TLS controls.
3. A protected HTTPS development origin **separate from all live services**. Railway configuration or resource creation may incur charges and requires separate approval.
4. Only after the backend passes end-to-end tests: enable the iPhone browser passkey controls and test real Safari registration/login, then record the verified result.

No hosting settings, existing Railway service, volumes, variables, deployments, user accounts or live money are changed by this PR.
