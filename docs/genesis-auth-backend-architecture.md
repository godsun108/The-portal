# Genesis identity, storage and permissions — proposed backend architecture

## Current status
**Design and pure contract validation only.** There is no real authentication, database, private API, account provisioning, payment entitlement, or user session in this change. Never treat browser-provided `verified:true` as proof of identity.

## Proposed trust boundary
1. Browser/mobile client sends session credential to a dedicated API over HTTPS. Avoid tokens in URLs and localStorage. Use appropriate secure, HttpOnly, SameSite cookies for web sessions, with CSRF protections when cookies authenticate mutations.
2. API verifies the credential using the configured identity provider's documented mechanism (issuer, audience, signature, expiration, revocation/session status as applicable). It builds a trusted principal from the verified subject, never from client JSON.
3. API validates requested resource kind, operation and resource ID. It fetches owner, visibility, blocks and membership entitlements from a trusted database. All sensitive reads and writes are authorized server-side.
4. Media is private by default. Issue short-lived scoped signed delivery URLs only after authorization; revoke/expire them appropriately. Do not expose private bytes in error responses or caches.
5. Memberships use payment-provider verified webhooks and idempotent event processing; a browser checkout success page is not evidence of payment.
6. Chat requires participant validation for every history read, send, attachment and subscription. Block/report/moderation controls must be part of the API.
7. Separate live/video/music distribution and its rights/moderation requirements from the shared identity core.

## Data model candidates
- `accounts(id, provider_subject, created_at, status)`
- `profiles(account_id, display_name, privacy_settings)`
- `resources(id, kind, owner_id, visibility, created_at, status)`
- `resource_grants(id, resource_id, account_id, action, status, expires_at)`
- `memberships(id, creator_id, supporter_id, plan_id, status, valid_until)`
- `chat_participants(chat_id, account_id, role, status)`
- `audit_events(id, actor_id, action, resource_id, outcome, created_at)`

Use relational constraints, server timestamps, least-privilege database roles, scoped credentials, backup/recovery, data retention/deletion policies and indexes. Provider selection and costs remain open decisions.

## Next implementation gates
1. Select hosting, identity provider and database after reviewing free-tier limits, data ownership, iPhone login UX and ongoing costs.
2. Build an isolated development API using environment-scoped secrets, provider-verified sessions, real two-user integration tests, and CI secret scanning.
3. Verify resource isolation, revocation, expired entitlements, race conditions, abuse limits and denial of protected bytes.
4. Review operational security, privacy, legal requirements, and rollback before approving any public deployment or real users.

## Contract tests
`node --test earthchain-genesis/backend-contract.test.mjs`

This contract rejects malformed resource requests and requires a *trusted* verified-principal input. It does not itself verify a principal, persist data, or enforce permissions.
