# EarthChain Maps — provider-neutral place and route contracts

This feature branch extends the geographic Maps preview. It does not replace the legacy Portal discovery map.

## New in this slice

- `maps/maps-client.mjs`: same-origin client for EarthChain's future Maps API.
- `maps/index.html`: place search results, show-on-map action, start/destination selection and driving/walking/cycling route request UI.
- `tests/maps-client.test.mjs`: contract and failure-mode tests.

## API boundary

The browser talks only to same-origin EarthChain endpoints:

- `GET /api/maps/v1/places/search?q={query}&limit={n}`
- `POST /api/maps/v1/routes`

Place search response:

```json
{
  "schema": "earthchain.maps.place-search.v1",
  "results": [{
    "id": "provider-neutral-place-id",
    "name": "Place name",
    "formattedAddress": "Normalized address",
    "latitude": 27.273,
    "longitude": -80.358,
    "category": "place-category",
    "source": "configured-provider",
    "attribution": "Required attribution",
    "retrievedAt": "2026-11-21T12:00:00Z"
  }]
}
```

Route request:

```json
{
  "schema": "earthchain.maps.route-request.v1",
  "origin": { "latitude": 27.273, "longitude": -80.358 },
  "destination": { "latitude": 27.300, "longitude": -80.400 },
  "mode": "driving"
}
```

Route response must use schema `earthchain.maps.route.v1`, include GeoJSON LineString coordinates in [longitude, latitude] order, distance and duration estimates, source, attribution, retrieval time, freshness and traffic basis. Steps are optional. A response without source and timestamp is rejected.

## Current backend status

The client and UI are ready to call the same-origin contract, but the backend endpoints are not implemented or configured in this Portal preview. A 404 is shown as “not connected”; no provider or fabricated results are substituted. External OpenStreetMap search and directions remain optional handoffs.

## Provider policy

Do not point the generic client directly at public community demo services:
- The OpenStreetMap Foundation's public Nominatim service has strict application-wide limits, disallows client-side autocomplete, requires identifying application behavior and caching, and explicitly restricts use by generic no-code/low-code/vibe-coding platforms. EarthChain must make a deliberate provider decision and own compliance; for production, evaluate self-hosting or an explicitly approved geocoding provider.
- The public OSRM demo service is a best-effort demonstration endpoint, has no uptime guarantees and is restricted to reasonable non-commercial use. It is not a production navigation backend for EarthChain.

Any production provider must sit behind a server-side adapter that can be switched without an app update. Keep provider credentials server-side. Enforce quotas, cache where permitted, preserve attribution, avoid sending sensitive personal data, and disclose location transmission. Do not enable paid services without explicit approval.

## Failure and safety behavior

- Search is user-submitted, not keystroke autocomplete.
- Same-origin API paths only; the client rejects arbitrary external API base URLs.
- Invalid coordinates, travel modes, route geometry and malformed response schemas fail closed.
- 404 (not configured), 429 (rate limited), network failure and invalid payload are distinct.
- Route estimates display provider, freshness and source timestamp; they are not guaranteed travel times.
- No continuous location tracking, background navigation or emergency-routing claim.

## Next implementation steps

1. Implement authenticated same-origin API handlers and provider adapter registry in the Sovereign-Core service layer.
2. Select either a self-hosted open-data stack or a reviewed provider after coverage, terms, attribution, privacy, operational cost and iPhone performance comparison.
3. Add cached place search and place detail with source provenance.
4. Add route provider adapter, route geometry rendering and explicit no-route/stale states.
5. Test quotas, provider outage, cancellation, malformed payload, data retention and location-consent behavior.
