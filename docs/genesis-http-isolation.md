# Genesis HTTP isolation fixture — local tests only

Run `node --test earthchain-genesis/http-isolation.test.mjs` on Node 18+.

This fixture starts an ephemeral loopback-only HTTP server inside the test, sends real HTTP requests, and verifies that the synthetic Alice account receives private bytes while synthetic Bob, anonymous callers, and invalid bearer tokens do not. It also tests a public resource and rejects unsupported methods.

**Security limitation:** tokens are static fixtures in source code, not real credentials. This is not a production authentication service, does not verify real sessions or durable storage, and must never be exposed to the public internet or deployed. No user accounts, sensitive data, payments, or cloud resources are involved.

Next gate: select and configure a trusted auth provider in a separate approved development environment, enforce server-side resource authorization against trusted storage, and test signed-in users with revocation and audit logging.
