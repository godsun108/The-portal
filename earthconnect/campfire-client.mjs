/**
 * CAMPFIRE client adapter for EarthConnect.
 * Dormant unless connection/config.json has a verified HTTPS endpoint.
 * Presence is ephemeral and is never represented by a fabricated count.
 */
export async function loadCampfireConfig(fetchImpl = fetch) {
  const response = await fetchImpl("../connection/config.json", { cache: "no-store" });
  if (!response.ok) throw new Error("campfire_config_unavailable");
  const config = await response.json();
  if (config?.schema !== "portal.connection-config.v0") throw new Error("invalid_campfire_config");
  if (config.endpoint === null) return Object.freeze({ enabled: false, endpoint: null });
  const endpoint = new URL(config.endpoint, globalThis.location?.href);
  if (endpoint.protocol !== "https:") throw new Error("campfire_https_required");
  return Object.freeze({ enabled: true, endpoint: endpoint.href.replace(/\/$/, "") });
}

export async function checkCampfirePresence({ config, visitorId, fetchImpl = fetch, leaseSeconds = 45 }) {
  if (!config?.enabled || !config.endpoint) return Object.freeze({ state: "dormant" });
  if (typeof visitorId !== "string" || !/^[A-Za-z0-9-]{8,80}$/.test(visitorId)) throw new Error("invalid_visitor_id");
  const response = await fetchImpl(config.endpoint + "/v0/presence/campfire", {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ visitor_id: visitorId, lease_seconds: Math.max(10, Math.min(60, Number(leaseSeconds) || 45)) })
  });
  if (!response.ok) return Object.freeze({ state: "unavailable" });
  const result = await response.json();
  if (result?.schema !== "portal.presence.v0" || result.verified !== true || !Number.isInteger(result.others) || result.others < 0) {
    return Object.freeze({ state: "unavailable" });
  }
  return Object.freeze({ state: "verified", others: result.others, observedAt: result.observed_at });
}
