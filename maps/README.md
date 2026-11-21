# EarthChain Maps — first foundation slice

This directory is a new geographic Maps surface. It intentionally does not replace the older Portal discovery map at `/map/`.

## Included

- OpenStreetMap geographic map view, centered on an example view until the user chooses coordinates or grants one-time location access.
- Place-search handoff to OpenStreetMap's public search page. Search results are external; integrated geocoding has not yet been selected.
- Coordinate-based map centering and an external directions handoff.
- Browser-local saved places with explicit save/remove actions.
- Structured Earth Observatory camera-source directory at `camera-sources.json`.

## Deliberate limits

- No automatic location permission request or background location tracking.
- Saved places remain in this browser's local storage. They are not synced, backed up, or available to Genesis.
- Camera coordinates are null until verified. Camera pages are provider-hosted destinations; embedding and redistribution rights have not been established.
- Every camera status is `unknown`. A reachable provider page is not proof that a camera is broadcasting.
- No turn-by-turn navigation, route calculation, live traffic, offline map package, traffic-camera aggregation, or weather overlay.
- No account identity, cross-device sync, or server persistence.

## Provider and production decision still required

The prototype uses the OpenStreetMap public map view and search website as an exploratory, no-key starting point. This is not a production tile-service commitment. Before production, evaluate:
- self-hosted/open-source map rendering and tile infrastructure versus hosted providers;
- tile, geocoding and routing terms, attribution, rate limits, caching and costs;
- data residency, location disclosure, retention and privacy;
- iPhone PWA behavior, accessibility, performance and offline expectations.

Keep provider integrations behind replaceable adapters. Do not couple saved-place, identity, privacy, Genesis or camera-source contracts to a specific map vendor.

## Camera source contract

Each source records its provider, destination URL, region, coordinate verification state, access/embedding status and explicit status meaning. A future camera overlay must additionally require source ownership/authorization, verified coordinates, freshness, health, latency, access policy and retention metadata. Never infer a precise pin from a region name or present a stale still as live.

## Next milestones

1. Select and validate map/tile, geocoding and routing providers or self-hosted infrastructure.
2. Implement integrated place search and normalized place records.
3. Add account-scoped saved places with export, deletion and sync controls.
4. Add routing and navigation with clear freshness/offline states.
5. Add weather overlays through the shared Weather service.
6. Add only authorized, coordinate-verified camera overlays with truthful live/offline/unknown states.
7. Run browser and iPhone testing before promoting beyond preview.
