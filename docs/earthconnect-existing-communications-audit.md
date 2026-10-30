# Existing communication systems — implementation audit

Branch: `earthconnect/communications-space-v1`

This audit traces the existing communication-related implementations so new EarthConnect work can reuse them rather than create a duplicate stack.

## Verified reusable foundations

### Portal CAMPFIRE presence
- `connection/service/server.mjs` is a Node reference service for temporary CAMPFIRE presence leases.
- It uses an origin allowlist, bounded lease duration, visitor ID validation, per-visitor write rate limiting, and no-store responses.
- `connection/service/test.mjs` currently checks basic service boundaries.
- It is **presence only**: it does not persist chat messages, authenticate accounts, or provide calls.

### Sovereign-Core Web OS signaling
- `earthchain/web-os/signaling-server.mjs` implements temporary room signaling with an exact allowed origin, request rate limits, bounded payloads, expiry, room capacity, and no durable storage.
- `relay-signaling.mjs` is a client helper for sending/polling signals using an invitation nonce.
- `signaling-server.test.mjs` tests origin rejection, temporary signal exchange, and expiry.
- The docs and code characterize this as a research relay, not a production-ready identity or communications service.

### Shared Reality relay
- Portal `shared-reality-relay/server.mjs` provides WebSocket forwarding for a limited room/device model.
- It validates origin, room/device syntax, room size, payload size, and message schema.
- It is spatial/shared-reality message forwarding, not a general user messaging service.

### Genesis Voice
- Portal `genesis-voice/` is a speech interface for local browser interaction. It is not person-to-person voice or video calling.

## Integration direction

1. Keep EarthConnect as the user-facing shell and capability directory.
2. Reuse CAMPFIRE for presence only, where appropriate.
3. Reuse Sovereign-Core signaling for an explicitly labeled experimental peer-connection flow; do not imply relay signaling itself is a call.
4. Treat message delivery, durable conversations, account identity, contact discovery, push notifications, and production call infrastructure as separate capabilities requiring their own verified implementations and security review.
5. Route to existing Portal experiences (EarthSocial, EarthVideo, EarthLive, Portal TV) only with clear preview/available status; do not present fictional feeds or placeholder channels as live services.

## Current limitation

This is a repository-level code/documentation audit. No service has been deployed, no accounts or messages were created, and no real-time communications are asserted to work in production. Next implementation should be a thin, tested capability registry and route adapter, followed by a separately scoped secure message-delivery slice only after the intended backend is identified.
