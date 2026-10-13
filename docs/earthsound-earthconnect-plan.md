# EarthSound + EarthConnect: verified reuse and implementation plan

Status: architecture proposal only. No live social accounts, music streaming catalog, calling service or chat backend is activated by this document.

## Reuse inventory (verified source paths)

- `radio/index.html`: existing Portal radio experience. Candidate for EarthSound discovery; verify stream rights, formats and actual playback separately.
- `tv.html`: existing Portal television experience; candidate for sharing media into chats, subject to rights and safe-link validation.
- `genesis-voice/index.html`: existing voice-oriented interface. **Not evidence of person-to-person voice calling**. Do not conflate AI voice with communications.
- `earthchain-genesis/app.js`: EarthSound and EarthConnect appear as planned modules; reuse Genesis as navigation and status source.
- `earthsocial/`: interface preview of separate Friends & Family and Following feeds; **not** an identity service or social graph.
- `earthvideo/`: discovery preview in PR #171; **not** evidence of production video hosting.

## Product boundaries

**EarthSound:** licensed or creator-authorized songs, albums, podcasts, playlists, subscriptions, discovery, rights-aware playback and eventual creator payouts. Begin with creator-owned/explicitly licensed catalog; do not scrape Spotify or rehost copyrighted recordings without permission. Rights, territory, takedown, reporting and royalty obligations must be modeled before public launch.

**EarthConnect:** one-to-one text conversations, private groups, group spaces, voice calls, video calls and group meetings. Friend/family audience groups are separate from room membership and messaging permissions. Chat data must not be exposed to EarthSocial feeds or recommendations.

## Sequence and acceptance gates

1. **Identity and consent contract**: account IDs, device sessions, invitations, block/report, contact discovery opt-in, data export and deletion. No phonebook harvesting.
2. **Private chat MVP**: authenticated membership-scoped rooms, durable messages, pagination, delivery states, spam/rate limits, attachment validation and access tests. Encryption-at-rest and transport TLS baseline; if end-to-end encryption is promised, implement audited key management and multi-device recovery before claiming it.
3. **Audio/video calling**: WebRTC for one-to-one media, authenticated signaling, TURN/STUN, explicit camera/microphone permissions, iOS Safari testing, reconnect and abuse protections. For group calls, evaluate an SFU and bandwidth/egress budget; do not assume mesh calls scale.
4. **EarthSound creator catalog**: creator-authorized upload, transcoding, metadata, rights and territory flags, content review, accessible playback, playlists and library. No unlicensed commercial catalog.
5. **Super-app integration**: share approved song/video links into authorized chats, launch calls from rooms, expose notifications by opt-in, maintain separate private-data boundaries.

## Operational constraints

- No new production routes, credentials, storage buckets, vendor bills, ledger changes, automatic release or irreversible user-data mutations without owner review.
- Public static GitHub Pages alone cannot provide private persistent chat, media uploads or WebRTC signaling/TURN.
- Test with two distinct authenticated devices/accounts before claiming working direct chat or calling; group calls require a separate multi-device test.
- Test audio rights and playback on actual iPhone hardware before claiming Spotify-like operation.
- Cost gates: storage, transcoding, media egress, TURN/SFU bandwidth, moderation and support.

## First vertical slice

Build a **safe interface preview** for EarthConnect with direct messages, group rooms and call entry points visibly disabled until services exist; link the existing radio experience from an EarthSound preview. Next, implement an independently tested server-side membership and permission contract before enabling message writes.
