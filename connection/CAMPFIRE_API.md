# CAMPFIRE API v0

Canonical Portal connection transport contract.

## Endpoint

Portal discovers the service from `connection/config.json`. If `endpoint` is null, CAMPFIRE is dormant and must not fabricate presence.

### POST /v0/presence/campfire

Request:
```json
{"visitor_id":"random browser session id","lease_seconds":45}
```

Response:
```json
{"schema":"portal.presence.v0","room":"campfire","verified":true,"others":2,"lease_seconds":45,"observed_at":"2026-09-27T00:00:00Z"}
```

`others` excludes the caller. The UI may display it only when `verified === true`.

### DELETE /v0/presence/campfire/:visitor_id

Best-effort early lease release. Correctness must not depend on DELETE; leases expire server-side.

## Service requirements

- HTTPS.
- CORS restricted to the Portal production origin plus explicit development origins.
- Random session IDs only; no account, email, IP, location, or fingerprint exposed to clients.
- Server-enforced lease maximum <= 60 seconds.
- Expired leases never count.
- Rate limit writes.
- No presence history endpoint.
- No fabricated seed users or demo counts in production.
- `Cache-Control: no-store`.
- Failure is represented as unavailable, never as a synthetic count.
