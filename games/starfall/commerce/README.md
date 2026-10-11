# EarthChain offline test hangar

Open `games/starfall/commerce/` after creating/restoring the existing Portal EarthChain test wallet. This page reads the encrypted vault from its existing same-origin storage, unlocks only in memory, imports explicitly trusted coordinator-signed public offer/receipt files, reviews exact terms, and exports signed BUY requests. Pending requests are persisted before download. Never share passwords, encrypted wallet backups or private keys with the coordinator.

Operator commands and trust model are in Sovereign-Core `earthchain/commerce/BROWSER_PURCHASE.md` on PR #4. The Node coordinator must run separately; this page does not host it. Commerce test balances are separate from the existing two-party wallet's points. No real-money purchases are available.

`browser-commerce.mjs` is vendored byte-for-byte from Sovereign-Core's canonical module. It verifies coordinator attestations, not distributed consensus. The game only equips metadata-bound Starfall hulls for the signed view lifetime (at most five minutes). There is no immediate cross-device revocation, public-chain mint or server-side entitlement enforcement. Returning to local equipment after expiry does not destroy ownership.

A pinned network cannot silently change. To resolve an expired pending packet the operator must return an explicit signed `not_found` check for the request after its expiry, or the original settled receipt. Re-export/re-submit identical requests on uncertainty.

Device/browser visual behavior remains unverified; Node WebCrypto and real-file operator integration tests live in the canonical repository.

## Direct hosted checkout

`direct.html` is the default game shop. It uses the pinned HTTPS endpoint/network/key in `hosted-config.json`, signs a login challenge locally, receives a one-time 200 ECTEST allocation, and submits reviewed signed BUY packets. The bearer session stays in memory and is cleared on lock or tab hiding. Pending signed purchases persist before submission and recover through signed receipt/status lookup. Owned metadata-bound hulls can be selected; the newest purchase is selected automatically. Refresh ownership after its five-minute view expires.

The hosted coordinator is limited to 40 funded wallets and 1,000 events. It is a persistent, centralized, valueless test service. No real funds or public-chain NFTs. Existing offline tools remain accessible at index.html. iPhone purchase flow still needs user verification.
