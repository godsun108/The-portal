# Earthchain Genesis: Connected Spaces Roadmap

Status: planning/preview integration; not a production launch declaration.

## Product vision
Earthchain Genesis is the mobile-first entry point for a connected ecosystem:
- Social: communities, profiles, posts, creator updates, and sharing.
- Commerce: creator and community storefronts, listings, and purchases.
- Streaming: video discovery, channels, creator broadcasts, and watch experiences.
- Communications: private messaging and, later, audio/video calls.
- Wallet: Earthcoin test and production environments remain visibly distinct.

## Existing Portal foundations identified
- `earthsocial/`: static feed preview with example-only posts; source explicitly says no user data, network calls, or social graph storage.
- `earthchain-genesis/`: super-app directory and module links.
- `earthvideo/`, `earthlive/`, and Portal TV-related workflows: discovery/preview and stream-health/catalog work; confirm actual playback and creator ingest before labeling as live streaming.
- `earthchain/commerce/demo-marketplace.html` in Sovereign-Core: demo marketplace foundation.
- `earthconnect/`: communications UI preview being developed in the related draft PR.

## Build sequence
1. **Connect the shells:** route Social, Marketplace, Streaming, and EarthConnect from Genesis; align navigation, branding, and mobile layout.
2. **Social foundation:** identity/profile contract, feed data model, post composer, media attachment metadata, visibility/audience controls, reactions/comments, reporting/blocking, and moderation queues.
3. **Marketplace foundation:** catalog/listings, seller/creator profile linkage, search/categories, cart/order state, receipts, and clear test-mode/payment status.
4. **Streaming foundation:** unify discovery across Portal TV/EarthVideo/EarthLive; classify catalog, embedded playback, owned hosting, and live ingest distinctly; creator/channel pages and schedules.
5. **Cross-space connections:** posts link to products and streams; creator pages unify social, store, and video; wallet transactions can attach to marketplace order records after audit.
6. **Communications:** integrate verified existing text messaging first; then evaluate call/video signaling, identity, consent, abuse protection, and connectivity requirements.

## Integration and safety gates
- Reuse existing repos, contracts, and services; avoid duplicate implementations.
- Do not imply that example data, UI buttons, or discovery previews are functional backends.
- Do not store private messages, credentials, or real payment data in browser localStorage.
- Use explicit testnet/demo labeling until production network/payment integration is verified.
- Before launch: auth/authorization checks, privacy settings, reporting/blocking, rate limits, abuse handling, accessible mobile UX, security review, and end-to-end tests.
- Streaming launch requires rights/permission review for content, actual media delivery, and reliable playback; live video additionally requires ingest and distribution infrastructure.
- Marketplace launch requires verified wallet/payment flow, order state, seller protections, dispute/refund policy, and clear fees.

## Immediate next technical task
Trace existing social, marketplace, and streaming implementations and contracts across Portal and Sovereign repos. Produce a verified integration map before wiring services or duplicating them.
