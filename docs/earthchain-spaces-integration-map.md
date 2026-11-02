# Verified Earthchain spaces integration map

Repository audit: main branches inspected; this document distinguishes working foundations from previews.

## Social
Portal earthsocial/app.js contains two hard-coded fictional feeds (Friends & Family and Following). Its source comment explicitly states no user data, network calls, or social graph storage. Genesis earthchain-genesis/app.js labels EarthSocial planned. Do not treat this as a backend.

## Marketplace / commerce
Sovereign-Core earthchain/commerce/ is a substantial prototype foundation: catalogue, demo marketplace, creator rewards, royalty consent/splits, deal rooms, reconciliation, signed exchange, preview/local dashboard, and tests. The commerce README states there is no checkout, payment processing, wallet, tax, escrow, shipping, consumer protection, identity verification, or deployed storefront. Creator reward units are simulated and nonredeemable. Demo marketplace is fixture-only and does not publish listings or process payments.
Portal Genesis has a separate EarthMarket entry for test collectibles and says USD storefront/physical goods are not connected. Integration should preserve boundaries and reuse existing commerce contracts rather than build a duplicate shop.

## Video / streaming
Portal TV docs describe a v0.2 browser prototype: local-file playback and user-provided authorized direct media URLs, with placeholder channels and no guaranteed streams. earthvideo/app.js is a discovery-card preview; cards explicitly say not playable. earthlive/app.js is category-only and says no live streams. Genesis labels EarthVideo/EarthLive previews and EarthTV candidate integration.
The repository includes TV catalog, device playback tests, stream-health probes, and rights-review workflows. These are useful foundations for authorized discovery/playback QA, but do not alone prove owned live ingest, hosting, content rights, or a creator broadcast pipeline.

## Proposed integration direction
- Genesis is the navigation shell.
- EarthSocial needs a real identity/data service before user-generated content is persisted.
- Sovereign-Core commerce prototypes are the commerce domain foundation; connect to Genesis only via reviewed, authenticated service contracts and explicit demo/test mode.
- Portal TV is the authorized discovery/playback foundation; EarthVideo/EarthLive become consistent views over it, with honest status labels.
- EarthConnect integrates only after locating the verified messaging implementation and identity contract.

## Launch blockers
Auth/authorization, persistence, privacy, moderation/report/block, rate limiting, payments/settlement, order support/disputes, creator rights/licensing, live media ingest/distribution, iOS playback checks, and end-to-end tests. Keep all demo fixtures and test tokens clearly labeled; never imply real funds, payouts, user posts, messages, or live streams.