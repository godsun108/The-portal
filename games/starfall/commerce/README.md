# EarthChain offline test hangar

Open `games/starfall/commerce/` after creating/restoring the existing Portal EarthChain test wallet. This page reads the encrypted vault from its existing same-origin storage, unlocks only in memory, imports explicitly trusted coordinator-signed public offer/receipt files, reviews exact terms, and exports signed BUY requests. Pending requests are persisted before download. Never share passwords, encrypted wallet backups or private keys with the coordinator.

Operator commands and trust model are in Sovereign-Core `earthchain/commerce/BROWSER_PURCHASE.md` on PR #4. The Node coordinator must run separately; this page does not host it. Commerce test balances are separate from the existing two-party wallet's points. No real-money purchases are available.

`browser-commerce.mjs` is vendored byte-for-byte from Sovereign-Core's canonical module. It verifies coordinator attestations, not distributed consensus. The game only equips metadata-bound Starfall hulls for the signed view lifetime (at most five minutes). There is no immediate cross-device revocation, public-chain mint or server-side entitlement enforcement. Returning to local equipment after expiry does not destroy ownership.

A pinned network cannot silently change. To resolve an expired pending packet the operator must return an explicit signed `not_found` check for the request after its expiry, or the original settled receipt. Re-export/re-submit identical requests on uncertainty.

Device/browser visual behavior remains unverified; Node WebCrypto and real-file operator integration tests live in the canonical repository.
