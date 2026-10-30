import test from "node:test";
import assert from "node:assert/strict";
import { EARTHCONNECT_CAPABILITIES, getCapability, capabilityIsLaunchable } from "./capabilities.mjs";

test("capability ids are unique", () => {
  const ids = EARTHCONNECT_CAPABILITIES.map(item => item.id);
  assert.equal(new Set(ids).size, ids.length);
});
test("every capability has an explicit honest readiness state", () => {
  for (const item of EARTHCONNECT_CAPABILITIES) {
    assert.equal(typeof item.label, "string");
    assert.equal(typeof item.state, "string");
    assert.equal(typeof item.foundation, "string");
  }
});
test("message delivery is not advertised as launchable before integration", () => {
  assert.equal(getCapability("messages").state, "integration-pending");
  assert.equal(capabilityIsLaunchable(getCapability("messages")), false);
});
test("experimental signaling is not treated as an available mesh network", () => {
  assert.equal(getCapability("mesh").state, "experimental");
  assert.equal(capabilityIsLaunchable(getCapability("mesh")), false);
});
test("unknown capability is safely absent", () => {
  assert.equal(getCapability("unknown"), null);
  assert.equal(capabilityIsLaunchable(null), false);
});
