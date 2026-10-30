/* EarthID device inventory, SQLite prototype.
 * Call only after the server has authenticated the account. A device ID is
 * metadata, never a bearer credential or proof of authentication.
 */
import { randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const validSubject = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const platforms = new Set(["ios", "ipados", "macos", "windows", "linux", "android", "other"]);
const MAX_ACTIVE_DEVICES = 50;

function validateLabel(label) {
  if (typeof label !== "string") throw new TypeError("invalid_device_label");
  const value = label.trim();
  if (!value || value.length > 80 || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new TypeError("invalid_device_label");
  }
  return value;
}

function validateNow(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("invalid_device_clock");
  return value;
}

export function createDeviceInventory({ databasePath = ":memory:", now = () => Date.now(), maxActiveDevices = MAX_ACTIVE_DEVICES } = {}) {
  if (!Number.isSafeInteger(maxActiveDevices) || maxActiveDevices < 1 || maxActiveDevices > MAX_ACTIVE_DEVICES) {
    throw new TypeError("invalid_device_limit");
  }
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS earthid_devices (
      device_id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      label TEXT NOT NULL,
      platform TEXT NOT NULL,
      enrolled_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL,
      revoked_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS earthid_devices_subject_idx
      ON earthid_devices(subject, revoked_at, last_seen_at);
  `);
  const insert = db.prepare("INSERT INTO earthid_devices(device_id,subject,label,platform,enrolled_at,last_seen_at,revoked_at) VALUES(?,?,?,?,?,?,NULL)");
  const countActive = db.prepare("SELECT COUNT(*) AS count FROM earthid_devices WHERE subject=? AND revoked_at IS NULL");
  const selectOne = db.prepare("SELECT device_id,subject,label,platform,enrolled_at,last_seen_at,revoked_at FROM earthid_devices WHERE subject=? AND device_id=?");
  const selectAll = db.prepare("SELECT device_id,subject,label,platform,enrolled_at,last_seen_at,revoked_at FROM earthid_devices WHERE subject=? ORDER BY enrolled_at,device_id");
  const updateSeen = db.prepare("UPDATE earthid_devices SET last_seen_at=? WHERE subject=? AND device_id=? AND revoked_at IS NULL");
  const revokeOne = db.prepare("UPDATE earthid_devices SET revoked_at=? WHERE subject=? AND device_id=? AND revoked_at IS NULL");
  const revokeAll = db.prepare("UPDATE earthid_devices SET revoked_at=? WHERE subject=? AND revoked_at IS NULL");

  const present = row => row ? ({
    deviceId: row.device_id,
    label: row.label,
    platform: row.platform,
    enrolledAt: row.enrolled_at,
    lastSeenAt: row.last_seen_at,
    revokedAt: row.revoked_at,
    active: row.revoked_at === null,
  }) : null;

  return {
    enroll(subject, { label, platform }) {
      if (!validSubject(subject)) throw new TypeError("invalid_verified_subject");
      const cleanLabel = validateLabel(label);
      if (!platforms.has(platform)) throw new TypeError("invalid_device_platform");
      if (countActive.get(subject).count >= maxActiveDevices) throw new Error("active_device_limit_reached");
      const timestamp = validateNow(now());
      const deviceId = randomBytes(24).toString("base64url");
      insert.run(deviceId, subject, cleanLabel, platform, timestamp, timestamp);
      return present(selectOne.get(subject, deviceId));
    },
    list(subject, { includeRevoked = false } = {}) {
      if (!validSubject(subject)) throw new TypeError("invalid_verified_subject");
      return selectAll.all(subject).map(present).filter(device => includeRevoked || device.active);
    },
    touch(subject, deviceId) {
      if (!validSubject(subject) || typeof deviceId !== "string") return false;
      const existing = selectOne.get(subject, deviceId);
      if (!existing || existing.revoked_at !== null) return false;
      const timestamp = validateNow(now());
      if (timestamp < existing.last_seen_at) throw new Error("device_clock_moved_backwards");
      return updateSeen.run(timestamp, subject, deviceId).changes === 1;
    },
    revoke(subject, deviceId) {
      if (!validSubject(subject) || typeof deviceId !== "string") return false;
      const timestamp = validateNow(now());
      return revokeOne.run(timestamp, subject, deviceId).changes === 1;
    },
    revokeAll(subject) {
      if (!validSubject(subject)) throw new TypeError("invalid_verified_subject");
      return revokeAll.run(validateNow(now()), subject).changes;
    },
    close() {
      db.close();
    },
  };
}
