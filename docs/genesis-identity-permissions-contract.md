# Genesis shared identity and permissions contract (prototype)

## Status
A pure policy prototype and unit tests, **not live security**. No real accounts, authentication provider, authorization enforcement, member payments, messaging or creator access are enabled by this PR. Do not import the browser-visible module as the sole authorization gate: client code can be bypassed.

## Model
- Actor: trusted, server-verified principal `{id, authenticated}`.
- Resource: trusted server-owned record `{id, ownerId, visibility}` where visibility is public, followers, members or private.
- Action: enumerated permission such as content:read, content:create, chat:send, stream:start or billing:manage.
- Grant: trusted server record `{actorId, resourceId, action, active}` representing a previously verified entitlement. **Do not accept grants submitted by the browser**.
- Result: `{allowed,reason}`, deny by default. Owner is allowed for enumerated actions; other actors can read public resources or receive a specific active grant. Followers/members do not grant automatic access; entitlement verification must produce explicit grants.

## Before production
1. Choose an authentication provider with secure session management and recovery; define unique user and creator IDs.
2. Enforce checks server-side on every protected request, including media URLs, messaging and payments.
3. Validate resources, ownership and grants against trusted database records; never accept claimed `authenticated` or `ownerId` from clients.
4. Add blocklists, consent, moderation, account deletion, rate limits, abuse reporting, audit logs, privacy and age policy.
5. Verify subscription lifecycle through provider-signed webhook events before issuing or revoking membership grants; no live billing without explicit approval.
6. Build integration tests for cross-user isolation, expired entitlements, revoked grants and race conditions.
7. Run security review and iPhone browser tests before exposing personal data.

Run prototype tests locally with `node --test earthchain-genesis/permissions.test.mjs`.
