/* Atomic EarthID device/session revocation coordinator.
 * Use the SAME SQLite database file as device inventory and durable sessions.
 * This operation is atomic across the two tables. It does not revoke WebAuthn
 * credentials or prove that a passkey belongs to one physical device.
 */
import { DatabaseSync } from "node:sqlite";

const validSubject = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validDeviceId = value => typeof value === "string" && /^[A-Za-z0-9_-]{32}$/.test(value);
const validNow = value => Number.isSafeInteger(value) && value >= 0;

function requireColumns(db, table, required) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  const columns = new Set(rows.map(row => row.name));
  if (required.some(name => !columns.has(name))) {
    throw new Error(`incompatible_${table}_schema`);
  }
}

export function createDeviceRevocationCoordinator({ databasePath = ":memory:", now = () => Date.now() } = {}) {
  const db = new DatabaseSync(databasePath);
  try {
    requireColumns(db, "earthid_devices", ["device_id", "subject", "revoked_at"]);
    requireColumns(db, "earthid_sessions", ["subject", "device_id"]);
  } catch (error) {
    db.close();
    throw error;
  }

  const revokeOne = db.prepare(
    "UPDATE earthid_devices SET revoked_at=? WHERE subject=? AND device_id=? AND revoked_at IS NULL"
  );
  const revokeAll = db.prepare(
    "UPDATE earthid_devices SET revoked_at=? WHERE subject=? AND revoked_at IS NULL"
  );
  const deleteDeviceSessions = db.prepare(
    "DELETE FROM earthid_sessions WHERE subject=? AND device_id=?"
  );
  const deleteSubjectSessions = db.prepare(
    "DELETE FROM earthid_sessions WHERE subject=? AND device_id IS NOT NULL"
  );

  function transact(work) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      try { db.exec("ROLLBACK"); } catch {}
      throw error;
    }
  }

  return {
    revokeDevice(subject, deviceId) {
      if (!validSubject(subject) || !validDeviceId(deviceId)) return { revoked: false, sessionsRevoked: 0 };
      const timestamp = now();
      if (!validNow(timestamp)) throw new RangeError("invalid_device_clock");
      return transact(() => {
        const device = revokeOne.run(timestamp, subject, deviceId);
        const sessions = deleteDeviceSessions.run(subject, deviceId);
        return { revoked: device.changes === 1, sessionsRevoked: sessions.changes };
      });
    },
    revokeAllDevices(subject) {
      if (!validSubject(subject)) throw new TypeError("invalid_verified_subject");
      const timestamp = now();
      if (!validNow(timestamp)) throw new RangeError("invalid_device_clock");
      return transact(() => {
        const devices = revokeAll.run(timestamp, subject);
        const sessions = deleteSubjectSessions.run(subject);
        return { devicesRevoked: devices.changes, sessionsRevoked: sessions.changes };
      });
    },
    close() { db.close(); }
  };
}
