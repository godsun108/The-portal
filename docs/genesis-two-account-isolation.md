# Genesis two-account isolation proof — policy-only

## Scope
Run `node --test earthchain-genesis/permissions.test.mjs earthchain-genesis/isolation.test.mjs`.

The test fixture models two *synthetic* authenticated principals, Alice and Bob. It checks that Bob cannot read/edit Alice's private content, that a membership entitlement is action- and resource-scoped, that revocation denies access, and that chat grants do not silently confer other rights.

**This is not a real two-account login test.** No authentication server, trusted database, private media gateway, actual membership ledger, chat transport, or user session exists in this proof. The fixtures explicitly pass simulated `authenticated:true` values and simulated grants; production systems must never trust these from a browser.

## Required next gate
Implement a trusted test-only authentication service with two isolated test users and a protected API. Authenticate separately, query private resources and attempt cross-user access, validate denied HTTP status codes, and verify that the backend never returns protected bytes. Repeat for expired/revoked membership entitlements, chat participants and signed media URLs. Keep all real money, user data, secrets and production deployments out of scope until explicitly approved.
