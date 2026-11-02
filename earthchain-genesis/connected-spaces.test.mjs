import test from "node:test";
import assert from "node:assert/strict";
import { loadConnectedSpaceStatus } from "./connected-spaces.mjs";

test("Genesis reads EarthConnect readiness without promoting previews to live services", async () => {
  const items = await loadConnectedSpaceStatus();
  const messages = items.find(item => item.id === "messages");
  const presence = items.find(item => item.id === "presence");
  const calls = items.find(item => item.id === "voice");
  assert.equal(messages.state, "integration-pending");
  assert.equal(presence.state, "reference-service");
  assert.equal(calls.state, "not-connected");
});
test("Genesis adapter rejects an invalid registry", async () => {
  await assert.rejects(() => loadConnectedSpaceStatus(async () => ({ EARTHCONNECT_CAPABILITIES: {} })), /invalid_earthconnect_registry/);
});
