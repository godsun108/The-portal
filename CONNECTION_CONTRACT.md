# PORTAL CONNECTION CONTRACT v0

Status: **contract only — no shared backend is live yet**

Portal connection is a small shared substrate for rooms that need real human-to-human state. It is not a social network.

## Truth rule

**No remote human is ever fabricated.**

If the connection service is unavailable, empty, stale, or unverified, a room must say so or remain quiet. It must never invent presence counts, messages, collaborators, gifts, opponents, or activity.

## Initial primitives

A future canonical service may expose only a few room-neutral primitives:

- `presence(room)` — short-lived anonymous presence leases.
- `drop(room, payload)` — leave a bounded artifact/message for a future visitor.
- `take(room)` — receive an eligible drop without exposing sender identity by default.
- `signal(room, payload)` — ephemeral event for simultaneous visitors.
- `session(room)` — temporary shared session for a game, puzzle, artwork, or conversation.

Rooms should compose these primitives rather than own separate databases.

## Identity

Core Portal remains usable without an account.

The connection layer should begin with pseudonymous, short-lived browser identities. Persistent identity is optional and must be explicit. Fonzi/Victory identity integration is a future consumer path, not a requirement for basic connection.

## Privacy

Collect the minimum necessary to deliver the interaction.
Do not expose IP addresses, precise location, email, legal name, or device fingerprints to other visitors.
Do not build public follower/following graphs for the core Portal experience.
Do not make presence history publicly searchable.

## Safety / abuse boundary

Before public free-text exchange, the shared service needs rate limits, payload limits, reporting/moderation controls, retention rules, and abuse-resistant identifiers.
The first public connection primitive should therefore be deliberately constrained.

## First room: CAMPFIRE

CAMPFIRE is the first connection surface.

Until a real shared service exists, it displays:

**NO FIRE YET. THIS ROOM REFUSES TO INVENT COMPANY.**

Once the canonical service is deployed, CAMPFIRE may become a temporary shared place where real simultaneous visitors can acknowledge one another and eventually exchange bounded signals.

The dormant room is intentional: it establishes the product and truth boundary before infrastructure exists.
