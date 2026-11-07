/* Atomic account-scoped WebAuthn credential revocation.
 * Must share the same SQLite file as credentials and durable sessions.
 * The subject is trusted server-side identity, never request-body input.
 */
import { DatabaseSync } from "node:sqlite";

const validSubject = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validCredentialId = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);

export function createCredentialRevocationCoordinator({ databasePath = ":memory:" } = {}) {
  const db = new DatabaseSync(databasePath);
  const schema = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('credentials','earthid_sessions')").all();
  const names = new Set(schema.map(row => row.name));
  const credentialColumns = names.has("credentials")
    ? new Set(db.prepare("PRAGMA table_info(credentials)").all().map(row => row.name))
    : new Set();
  const sessionColumns = names.has("earthid_sessions")
    ? new Set(db.prepare("PRAGMA table_info(earthid_sessions)").all().map(row => row.name))
    : new Set();
  if (!names.has("credentials") || !names.has("earthid_sessions") ||
      !["id", "account_id", "revoked"].every(name => credentialColumns.has(name)) ||
      !["subject", "credential_id"].every(name => sessionColumns.has(name))) {
    db.close();
    throw new Error("credential_revocation_schema_unavailable");
  }
  const owned = db.prepare("SELECT revoked FROM credentials WHERE id=? AND account_id=?");
  const mark = db.prepare("UPDATE credentials SET revoked=1 WHERE id=? AND account_id=? AND revoked=0");
  const removeSessions = db.prepare("DELETE FROM earthid_sessions WHERE subject=? AND credential_id=?");

  return {
    revokeCredential(subject, credentialId) {
      if (!validSubject(subject) || !validCredentialId(credentialId)) {
        throw new TypeError("invalid_verified_credential_identity");
      }
      db.exec("BEGIN IMMEDIATE");
      try {
        const existing = owned.get(credentialId, subject);
        if (!existing) {
          db.exec("ROLLBACK");
          return { revoked: false, sessionsRevoked: 0 };
        }
        const credentialChanged = mark.run(credentialId, subject).changes === 1;
        const sessionsRevoked = removeSessions.run(subject, credentialId).changes;
        db.exec("COMMIT");
        return { revoked: credentialChanged || existing.revoked === 1, sessionsRevoked };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    close() { db.close(); }
  };
}
