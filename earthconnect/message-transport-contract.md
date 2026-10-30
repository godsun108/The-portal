# EarthConnect message transport contract

Status: interface specification only. No message backend is connected or deployed.

## Repository findings

The inspected Portal and Sovereign-Core paths do not currently establish a reusable private direct-message service:

- `earthsocial/app.js` explicitly renders fictional example posts and performs no network calls or social-graph storage.
- `signal/index.html` is an atmospheric receiver/art experience, not a person-to-person messaging transport.
- Sovereign-Core `genesis/learned-context.mjs` and its conversation research concern Genesis context/conversation behavior, not authenticated user-to-user conversations.
- Sovereign-Core `earthchain/web-os/` provides experimental peer signaling and connection approval primitives. These do not provide durable message history, authenticated membership, or delivery guarantees.
- The separate CAMPFIRE service is presence-only and must not be repurposed as a message store.

This is a finding about the inspected repository paths, not a claim that no code exists in any uninspected/private repository or branch.

## Required adapter boundary

A future transport adapter should expose these operations without leaking provider-specific details into the EarthConnect UI:

- `getCapabilities()`: return explicit availability and supported features.
- `listConversations({ cursor, limit })`: return only conversations visible to the authenticated principal.
- `listMessages({ conversationId, cursor, limit })`: enforce conversation membership on every request.
- `sendMessage({ conversationId, clientMessageId, body })`: idempotent send; server derives sender identity from the authenticated session.
- `subscribe({ conversationId, onEvent })`: optional live updates; reconnect must reconcile from durable history.

## Security and correctness invariants

1. No client-supplied sender identity is trusted.
2. Every read and write is authorized against current conversation membership.
3. Message IDs and client idempotency keys are unique and bounded.
4. Text size, request rate, pagination, and subscription counts are bounded.
5. Blocking and reporting are enforced server-side, not just hidden in the UI.
6. Transport errors never silently become successful sends.
7. No message body is written to analytics, presence leases, or ordinary application logs.
8. End-to-end encryption is not claimed until key management, device recovery, and protocol review are complete.
9. The adapter remains disabled until a real authenticated endpoint and its authorization contract are verified.

## Deliberately not specified yet

Do not invent endpoint URLs, database tables, identity claims, key formats, or a provider. First identify the intended existing text backend or explicitly choose a new self-hostable implementation. Then write contract tests against that real service before enabling the UI.
