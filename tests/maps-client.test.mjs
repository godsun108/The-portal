import test from "node:test";
import assert from "node:assert/strict";
import { createMapsClient, MapsServiceError, isCoordinate, normalizePlace } from "../maps/maps-client.mjs";

const place = { id: "place-1", name: "EarthChain Test Place", latitude: 27.273, longitude: -80.358, source: "test-provider", attribution: "Test data", retrievedAt: "2026-11-21T12:00:00Z" };

test("coordinates and normalized place records are validated", () => {
  assert.equal(isCoordinate({ latitude: 90, longitude: 180 }), true);
  assert.equal(isCoordinate({ latitude: 91, longitude: 0 }), false);
  assert.equal(isCoordinate({ latitude: 0, longitude: -181 }), false);
  assert.equal(normalizePlace(place).name, place.name);
  assert.throws(() => normalizePlace({ id: "x", name: "bad", latitude: 91, longitude: 0 }), MapsServiceError);
});

test("client refuses non same-origin API base paths", () => {
  assert.throws(() => createMapsClient({ fetchImpl: async () => {}, basePath: "https://provider.example" }), TypeError);
  assert.throws(() => createMapsClient({ fetchImpl: async () => {}, basePath: "//provider.example" }), TypeError);
  assert.throws(() => createMapsClient({ fetchImpl: async () => {}, basePath: "/api/../outside" }), TypeError);
});

test("place search sends a normalized query to the EarthChain API contract", async () => {
  let called;
  const client = createMapsClient({ fetchImpl: async (url, options) => {
    called = { url, options };
    return { ok: true, json: async () => ({ schema: "earthchain.maps.place-search.v1", results: [place] }) };
  }});
  const results = await client.searchPlaces("  Port St. Lucie  ");
  assert.equal(called.url, "/api/maps/v1/places/search?q=Port%20St.%20Lucie&limit=8");
  assert.equal(called.options.credentials, "same-origin");
  assert.equal(results[0].id, "place-1");
});

test("search rejects invalid query length before network access", async () => {
  let called = false;
  const client = createMapsClient({ fetchImpl: async () => { called = true; } });
  await assert.rejects(client.searchPlaces("x"), error => error.code === "INVALID_QUERY");
  assert.equal(called, false);
});

test("route request uses normalized contract and validates returned geometry", async () => {
  let sent;
  const route = { schema: "earthchain.maps.route.v1", geometry: { type: "LineString", coordinates: [[-80.358,27.273],[-80.4,27.3]] }, summary: { distanceMeters: 5000, durationSeconds: 600 }, source: "test-router", attribution: "Test data", retrievedAt: "2026-11-21T12:00:00Z", freshness: "current" };
  const client = createMapsClient({ fetchImpl: async (url, options) => {
    sent = { url, options };
    return { ok: true, json: async () => route };
  }});
  const result = await client.getRoute({ origin: { latitude: 27.273, longitude: -80.358 }, destination: { latitude: 27.3, longitude: -80.4 }, mode: "walking" });
  assert.equal(sent.url, "/api/maps/v1/routes");
  assert.equal(sent.options.method, "POST");
  assert.equal(JSON.parse(sent.options.body).mode, "walking");
  assert.equal(result.summary.distanceMeters, 5000);
});

test("invalid route requests and malformed provider responses fail closed", async () => {
  const client = createMapsClient({ fetchImpl: async () => ({ ok: true, json: async () => ({ schema: "earthchain.maps.route.v1", geometry: { coordinates: [[500, 200]] }, summary: { distanceMeters: 1, durationSeconds: 1 }, source: "x", retrievedAt: "now" }) }) });
  await assert.rejects(client.getRoute({ origin: { latitude: 91, longitude: 0 }, destination: { latitude: 0, longitude: 0 } }), error => error.code === "INVALID_ROUTE_REQUEST");
  await assert.rejects(client.getRoute({ origin: { latitude: 0, longitude: 0 }, destination: { latitude: 1, longitude: 1 } }), error => error.code === "INVALID_ROUTE");
});

test("unconfigured service and rate limits are reported distinctly", async () => {
  const notConfigured = createMapsClient({ fetchImpl: async () => ({ ok: false, status: 404 }) });
  await assert.rejects(notConfigured.searchPlaces("Miami"), error => error.code === "NOT_CONFIGURED");
  const limited = createMapsClient({ fetchImpl: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(limited.searchPlaces("Miami"), error => error.code === "RATE_LIMITED");
});
