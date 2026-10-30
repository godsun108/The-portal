import test from "node:test";
import assert from "node:assert/strict";
import { loadCampfireConfig, checkCampfirePresence } from "./campfire-client.mjs";

test("null endpoint leaves CAMPFIRE dormant without a network presence call", async () => {
  const config = await loadCampfireConfig(async () => ({ ok: true, json: async () => ({ schema: "portal.connection-config.v0", endpoint: null }) }));
  assert.deepEqual(config, { enabled: false, endpoint: null });
  assert.deepEqual(await checkCampfirePresence({ config, visitorId: "visitor-12345678" }), { state: "dormant" });
});
test("rejects non-HTTPS configured endpoints", async () => {
  await assert.rejects(() => loadCampfireConfig(async () => ({ ok: true, json: async () => ({ schema: "portal.connection-config.v0", endpoint: "http://example.test" }) })), /campfire_https_required/);
});
test("rejects malformed visitor ids", async () => {
  await assert.rejects(() => checkCampfirePresence({ config: { enabled: true, endpoint: "https://presence.example" }, visitorId: "bad id", fetchImpl: async () => { throw Error("must not fetch"); } }), /invalid_visitor_id/);
});
test("returns verified count only for a verified server response", async () => {
  const config = { enabled: true, endpoint: "https://presence.example" };
  const verified = await checkCampfirePresence({ config, visitorId: "visitor-12345678", fetchImpl: async (url, options) => {
    assert.equal(url, "https://presence.example/v0/presence/campfire");
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => ({ schema: "portal.presence.v0", verified: true, others: 2, observed_at: "2026-10-30T00:00:00Z" }) };
  } });
  assert.equal(verified.state, "verified");
  assert.equal(verified.others, 2);
});
test("never exposes an unverified count", async () => {
  const result = await checkCampfirePresence({ config: { enabled: true, endpoint: "https://presence.example" }, visitorId: "visitor-12345678", fetchImpl: async () => ({ ok: true, json: async () => ({ schema: "portal.presence.v0", verified: false, others: 900 }) }) });
  assert.deepEqual(result, { state: "unavailable" });
});
