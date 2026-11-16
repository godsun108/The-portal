import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDeviceInventory } from "./device-inventory.mjs";
import { createDurableSessionStore } from "./durable-sessions.mjs";
import { createDeviceRevocationCoordinator } from "./device-revocation.mjs";

test("device revocation atomically revokes its sessions and preserves other devices/accounts", () => {
  const dir = mkdtempSync(join(tmpdir(), "earthid-revoke-"));
  const databasePath = join(dir, "earthid.db");
  const inventory = createDeviceInventory({ databasePath, now: () => 5000 });
  const sessions = createDurableSessionStore({ databasePath });
  const coordinator = createDeviceRevocationCoordinator({ databasePath, now: () => 6000 });
  try {
    const phone = inventory.enroll("alice", { label: "Phone", platform: "ios" });
    const tablet = inventory.enroll("alice", { label: "Tablet", platform: "ipados" });
    const otherPhone = inventory.enroll("bob", { label: "Phone", platform: "ios" });
    const phoneSession = sessions.issue("alice", { deviceId: phone.deviceId });
    const secondPhoneSession = sessions.issue("alice", { deviceId: phone.deviceId });
    const tabletSession = sessions.issue("alice", { deviceId: tablet.deviceId });
    const otherSession = sessions.issue("bob", { deviceId: otherPhone.deviceId });

    assert.deepEqual(coordinator.revokeDevice("alice", phone.deviceId), {
      revoked: true, sessionsRevoked: 2
    });
    assert.equal(sessions.resolve(phoneSession.token), null);
    assert.equal(sessions.resolve(secondPhoneSession.token), null);
    assert.equal(inventory.list("alice").some(d => d.deviceId === phone.deviceId), false);
    assert.deepEqual(sessions.resolve(tabletSession.token), {
      subject: "alice", verified: true, deviceId: tablet.deviceId
    });
    assert.deepEqual(sessions.resolve(otherSession.token), {
      subject: "bob", verified: true, deviceId: otherPhone.deviceId
    });
    assert.deepEqual(coordinator.revokeDevice("alice", phone.deviceId), {
      revoked: false, sessionsRevoked: 0
    });
  } finally {
    coordinator.close(); sessions.close(); inventory.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("account-wide device revocation removes all bound sessions for only that account", () => {
  const dir = mkdtempSync(join(tmpdir(), "earthid-revoke-all-"));
  const databasePath = join(dir, "earthid.db");
  const inventory = createDeviceInventory({ databasePath, now: () => 5000 });
  const sessions = createDurableSessionStore({ databasePath });
  const coordinator = createDeviceRevocationCoordinator({ databasePath, now: () => 6000 });
  try {
    const phone = inventory.enroll("alice", { label: "Phone", platform: "ios" });
    const tablet = inventory.enroll("alice", { label: "Tablet", platform: "ipados" });
    const bob = inventory.enroll("bob", { label: "Phone", platform: "android" });
    const a = sessions.issue("alice", { deviceId: phone.deviceId });
    const b = sessions.issue("alice", { deviceId: tablet.deviceId });
    const c = sessions.issue("bob", { deviceId: bob.deviceId });
    assert.deepEqual(coordinator.revokeAllDevices("alice"), {
      devicesRevoked: 2, sessionsRevoked: 2
    });
    assert.equal(sessions.resolve(a.token), null);
    assert.equal(sessions.resolve(b.token), null);
    assert.ok(sessions.resolve(c.token));
  } finally {
    coordinator.close(); sessions.close(); inventory.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("coordinator refuses a database without both expected schemas", () => {
  assert.throws(() => createDeviceRevocationCoordinator(), /incompatible_earthid_devices_schema/);
});
