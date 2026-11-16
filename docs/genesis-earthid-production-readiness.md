# EarthID production login readiness gate

## Current implementation

The branch contains local modules for WebAuthn registration/authentication verification, one-time browser ceremony handles, credential/session/device persistence, and revocation coordinators. The modules are integration prototypes; the browser ceremony coordinator stores pending handles in process memory and is not a web server or production session deployment.

## Do not deploy as production login until every gate below is met

### Trusted server boundary
- Implement a real server/API adapter with authenticated account lifecycle and trusted account lookup.
- Ensure account identity, username, RP ID, origin, and authorization decisions are server-selected.
- Never trust account ID, role, device ID, credential status, or session subject from a client request.
- Define supported deployment topology and shared state for multi-worker/multi-instance operation.
- Replace in-memory ceremony handles with shared, atomic, expiring server-side state, or prove a single-process deployment is an explicit supported design.

### Web and API controls
- Enforce HTTPS, RP ID/origin allowlists, strict request validation, CSRF defenses where cookie-backed, secure cookie attributes, appropriate CORS, rate limits, generic account-enumeration-safe responses, and bounded request sizes.
- Define session transport, rotation, logout, idle/absolute expiration, reauthentication for sensitive operations, and secure client storage.
- Configure secrets, environment separation, key management/rotation, and deployment permissions.

### Persistence and operations
- Review SQLite suitability and locking for intended deployment; define migrations, backups, restore drills, retention, and incident recovery.
- Apply least-privilege filesystem/database permissions and encryption-at-rest requirements.
- Add security audit events without secrets or bearer tokens; monitor abuse and operational failures.
- Specify credential revocation, device/session revocation, lost-device handling, and recovery behavior.

### Assurance
- Run all tests in the target runtime and deployment environment.
- Add end-to-end browser/API tests, concurrency/replay tests, and failure/rollback tests.
- Conduct independent security review and threat modeling before production launch.
- Document supported browsers/devices, accessibility, support process, and user-facing security notices.

## Status

This is a readiness checklist, not evidence that these controls have been implemented. Passing current repository CI verifies configured tests only; it is not a production security certification.
