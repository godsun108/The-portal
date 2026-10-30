import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDeviceInventory } from "./device-inventory.mjs";

test("device inventory persists metadata and isolates accounts", () => {
  const dir = mkdtempSync(join(tmpdir(), "earthid-devices-"));
  const databasePath = join(dir, "devices.db");
  let clock = 1000;
  try {
    let inventory = createDeviceInventory({ databasePath, now: () => clock });
    const phone = inventory.enroll("alice", { label: "My iPhone", platform: "ios" });
    assert.equal(phone.active, true);
    assert.equal(inventory.list("bob").length, 0);
    assert.equal(inventory.list("alice")[0].deviceId, phone.deviceId);
    inventory.close();

    inventory = createDeviceInventory({ databasePath, now: () => clock });
    assert.equal(inventory.list("alice")[0].label, "My iPhone");
    inventory.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("touch updates last-seen and refuses revoked or foreign devices", () => {
  let clock = 1000;
  const inventory = createDeviceInventory({ now: () => clock });
  try {
    const device = inventory.enroll("alice", { label: "Tablet", platform: "ipados" });
    clock = 1200;
    assert.equal(inventory.touch("alice", device.deviceId), true);
    assert.equal(inventory.list("alice")[0].lastSeenAt, 1200);
    assert.equal(inventory.touch("bob", device.deviceId), false);
    assert.equal(inventory.revoke("alice", device.deviceId), true);
    assert.equal(inventory.touch("alice", device.deviceId), false);
    assert.equal(inventory.revoke("alice", device.deviceId), false);
    assert.equal(inventory.list("alice").length, 0);
    assert.equal(inventory.list("alice", { includeRevoked: true })[0].active, false);
  } finally { inventory.close(); }
});

test("device limit and input validation fail closed", () => {
  const inventory = createDeviceInventory({ maxActiveDevices: 1, now: () => 1000 });
  try {
    inventory.enroll("alice", { label: "Phone", platform: "ios" });
    assert.throws(() => inventory.enroll("alice", { label: "Second", platform: "android" }), /device_limit/);
    assert.throws(() => inventory.enroll("bad subject", { label: "Phone", platform: "ios" }));
    assert.throws(() => inventory.enroll("alice", { label: " ", platform: "ios" }));
    assert.throws(() => inventory.enroll("alice", { label: "Phone", platform: "unknown" }));
    assert.equal(inventory.enroll("bob", { label: "Phone", platform: "android" }).active, true);
  } finally { inventory.close(); }
});

test("account-wide device revocation revokes only that account's inventory", () => {
  const inventory = createDeviceInventory({ now: () => 5000 });
  try {
    inventory.enroll("alice", { label: "Phone", platform: "ios" });
    inventory.enroll("alice", { label: "Laptop", platform: "macos" });
    inventory.enroll("bob", { label: "Phone", platform: "android" });
    assert.equal(inventory.revokeAll("alice"), 2);
    assert.equal(inventory.list("alice").length, 0);
    assert.equal(inventory.list("bob").length, 1);
  } finally { inventory.close(); }
});

test("last-seen timestamps cannot move backwards", () => {
  let clock = 2000;
  const inventory = createDeviceInventory({ now: () => clock });
  try {
    const device = inventory.enroll("alice", { label: "Phone", platform: "ios" });
    clock = 1999;
    assert.throws(() => inventory.touch("alice", device.deviceId), /clock_moved_backwards/);
  } finally { inventory.close(); }
});
