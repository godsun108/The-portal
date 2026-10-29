# Genesis HTTP isolation fixture — local tests only

Run `node --test earthchain-genesis/http-isolation.test.mjs` on Node 18+.

This fixture starts an ephemeral HTTP server bound to loopback by its test, sends real HTTP requests, and verifies synthetic Alice's private content is denied to synthetic Bob, anonymous callers, and invalid bearer tokens. It also exercises the complete HTTP request path for private → public → private visibility transitions: Alice can change her own resource, Bob can read while it is public, and Bob is denied again after it becomes private. Denied private responses are checked for sentinel leakage.

The `PATCH /posts/:id` visibility mutation is deliberately a fixture-only test route; it is not a production API contract. The handler checks a synthetic bearer token, validates the requested visibility, and applies the existing authorization policy for `content:edit`. The test binds the server to `127.0.0.1` on an ephemeral port.

**Security limitation:** tokens are static fixtures in source code, not real credentials. This is not a production authentication service, does not verify real sessions or durable storage, and must never be exposed to the public internet or deployed. No user accounts, sensitive data, payments, or cloud resources are involved.

Next gate: select and configure a trusted auth provider in a separate approved development environment, enforce server-side resource authorization against trusted storage, and test signed-in users with revocation and audit logging.
