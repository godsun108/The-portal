# Atomic device and session revocation

## Implemented coordinator
`genesis-core/device-revocation.mjs` adds an explicit revocation coordinator. Configure it with the **same SQLite database path** used by `createDeviceInventory` and `createDurableSessionStore`. It verifies that both expected schemas exist, then uses one `BEGIN IMMEDIATE` transaction to mark the device revoked and delete every durable session bound to that account/device. Account-wide revocation similarly marks all active devices revoked and deletes all device-bound sessions for that subject. A failed transaction rolls back both changes.

Use `revokeDevice(verifiedSubject, deviceId)` and `revokeAllDevices(verifiedSubject)` only after independently authenticating and authorizing the account. Never accept the subject from an untrusted request body. Keep the database path consistent across all three components.

## Security boundaries
- The coordinator is a local integration component, not an HTTP endpoint or production deployment.
- It requires the existing device and session tables; it does not create or migrate them.
- Direct calls to the inventory's lower-level `revoke` methods do not cascade to sessions. Account/device management must call this coordinator.
- Revoking sessions does not revoke WebAuthn credentials. A synced passkey may still authenticate on another device and could enroll a new device record. Credential revocation and recovery policy remain separate work.
- It does not prove physical-device identity or hardware attestation.
- SQLite filesystem permissions, encryption-at-rest, backup/restore, service authorization, audit logging, and operational recovery still require review.

## Tests
Run `node --test genesis-core/device-revocation.test.mjs` under Node 22. Tests cover same-database operation, device/account isolation, idempotency, and schema fail-closed behavior.
