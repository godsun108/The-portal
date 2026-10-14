# EarthID: iPhone-only development and testing path

**No laptop is needed for this workflow.** GitHub Actions executes the automated suite, and GitHub's mobile web interface can display changes, CI, pull requests and reviews.

A static mobile-friendly readiness page is included at `earthchain-genesis/earthid-readiness.html`. It checks secure-context, native WebAuthn, and JSON-options support directly in the device browser. It deliberately does **not** request credentials, contact an API, create accounts, or claim that EarthID is live.

## Next phase — gated, no surprise deployment
1. Keep existing authenticated enrollment, initial login and local API test fixtures CI-green.
2. Implement a production-quality HTTPS API with real identity onboarding, host/origin enforcement, atomic durable ceremony storage, abuse throttling, safe recoverability, CSRF protection and audit logging.
3. Choose a separately reviewed protected development host and HTTPS origin, only after approval of hosting and any cost. A GitHub Pages static site alone cannot host the verifier/database.
4. Deliver a limited Safari device-test page against that HTTPS host. Test on iPhone, record evidence, then consider any wider rollout.

**Never embed server keys, administrative tokens, real-account records, or private test API credentials in GitHub Pages.** Readiness is informational and not evidence of successful device authentication.
