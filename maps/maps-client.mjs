const API_ROOT = "/api/maps/v1";

export class MapsServiceError extends Error {
  constructor(message, { code = "MAPS_SERVICE_ERROR", status = 0 } = {}) {
    super(message);
    this.name = "MapsServiceError";
    this.code = code;
    this.status = status;
  }
}

export function isCoordinate(value) {
  return Boolean(value && Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) && value.latitude >= -90 &&
    value.latitude <= 90 && value.longitude >= -180 && value.longitude <= 180);
}

export function normalizePlace(value) {
  if (!value || typeof value.id !== "string" || !value.id ||
      typeof value.name !== "string" || !value.name || !isCoordinate(value)) {
    throw new MapsServiceError("The place service returned an invalid place.", { code: "INVALID_PLACE" });
  }
  return Object.freeze({
    id: value.id,
    name: value.name,
    formattedAddress: typeof value.formattedAddress === "string" ? value.formattedAddress : "",
    latitude: value.latitude,
    longitude: value.longitude,
    category: typeof value.category === "string" ? value.category : "unknown",
    source: typeof value.source === "string" ? value.source : "unknown",
    attribution: typeof value.attribution === "string" ? value.attribution : "",
    retrievedAt: typeof value.retrievedAt === "string" ? value.retrievedAt : null
  });
}

function normalizeRoute(value) {
  if (!value || !value.summary || !Array.isArray(value.geometry?.coordinates) ||
      value.geometry.coordinates.length < 2 ||
      !Number.isFinite(value.summary.distanceMeters) ||
      !Number.isFinite(value.summary.durationSeconds) ||
      typeof value.source !== "string" || typeof value.retrievedAt !== "string") {
    throw new MapsServiceError("The routing service returned an invalid route.", { code: "INVALID_ROUTE" });
  }
  const coordinates = value.geometry.coordinates.map(pair => {
    if (!Array.isArray(pair) || pair.length < 2 ||
        !Number.isFinite(pair[0]) || !Number.isFinite(pair[1]) ||
        pair[0] < -180 || pair[0] > 180 || pair[1] < -90 || pair[1] > 90) {
      throw new MapsServiceError("The route geometry contains invalid coordinates.", { code: "INVALID_ROUTE" });
    }
    return [pair[0], pair[1]];
  });
  return Object.freeze({
    geometry: Object.freeze({ type: "LineString", coordinates }),
    summary: Object.freeze({
      distanceMeters: value.summary.distanceMeters,
      durationSeconds: value.summary.durationSeconds
    }),
    source: value.source,
    attribution: typeof value.attribution === "string" ? value.attribution : "",
    retrievedAt: value.retrievedAt,
    trafficBasis: typeof value.trafficBasis === "string" ? value.trafficBasis : "not-included",
    freshness: typeof value.freshness === "string" ? value.freshness : "unknown",
    steps: Array.isArray(value.steps) ? value.steps : []
  });
}

export function createMapsClient({ fetchImpl = globalThis.fetch, basePath = API_ROOT } = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
  if (typeof basePath !== "string" || !basePath.startsWith("/") || basePath.startsWith("//") ||
      basePath.includes("..") || basePath.includes("://")) {
    throw new TypeError("Maps API base path must be a same-origin absolute path.");
  }

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetchImpl(basePath + path, {
        ...options,
        headers: { Accept: "application/json", ...(options.headers || {}) },
        credentials: "same-origin"
      });
    } catch {
      throw new MapsServiceError("Maps service could not be reached.", { code: "NETWORK_UNAVAILABLE" });
    }
    if (!response.ok) {
      throw new MapsServiceError(
        response.status === 404 ? "Maps service is not connected in this environment yet." :
        response.status === 429 ? "Maps service is busy. Please wait before trying again." :
        "Maps service returned an error. Please try again later.",
        { code: response.status === 404 ? "NOT_CONFIGURED" : response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR", status: response.status }
      );
    }
    try { return await response.json(); }
    catch { throw new MapsServiceError("Maps service returned unreadable data.", { code: "INVALID_RESPONSE" }); }
  }

  return Object.freeze({
    async searchPlaces(query, { signal, limit = 8 } = {}) {
      const q = String(query || "").trim();
      if (q.length < 2 || q.length > 200) {
        throw new MapsServiceError("Search must be between 2 and 200 characters.", { code: "INVALID_QUERY" });
      }
      const data = await request("/places/search?q=" + encodeURIComponent(q) +
        "&limit=" + encodeURIComponent(String(Math.min(10, Math.max(1, limit)))), { signal });
      if (data?.schema !== "earthchain.maps.place-search.v1" || !Array.isArray(data.results)) {
        throw new MapsServiceError("Place search response did not match the Maps contract.", { code: "INVALID_RESPONSE" });
      }
      return data.results.map(normalizePlace);
    },
    async getRoute({ origin, destination, mode = "driving" }, { signal } = {}) {
      if (!isCoordinate(origin) || !isCoordinate(destination)) {
        throw new MapsServiceError("Choose valid origin and destination places first.", { code: "INVALID_ROUTE_REQUEST" });
      }
      if (!["driving", "walking", "cycling"].includes(mode)) {
        throw new MapsServiceError("Choose a supported travel mode.", { code: "INVALID_TRAVEL_MODE" });
      }
      const data = await request("/routes", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: "earthchain.maps.route-request.v1",
          origin,
          destination,
          mode
        })
      });
      if (data?.schema !== "earthchain.maps.route.v1") {
        throw new MapsServiceError("Route response did not match the Maps contract.", { code: "INVALID_RESPONSE" });
      }
      return normalizeRoute(data);
    }
  });
}
