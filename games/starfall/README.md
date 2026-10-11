# EarthChain: Starfall

Playable browser-local vertical slice for the existing Portal. Serve the repository and open `games/starfall/`. Touch drag or WASD/arrows moves the ship, auto-fire is enabled, P/pause suspends play. Three 12-second sectors lead to the guardian. Green seeds repair hull. Winning awards 60 local credits and unlocks the cosmetic hangar; defeat awards 10. Purchases deduct local credits once and equip the hull. All hulls have identical combat stats.

## Truth boundary

This is not yet the requested full EarthChain NFT game economy. Credits, completion, and inventory are untrusted browser-local data; they have no monetary value and can be edited. No signature, payment, mint, scarcity, consensus, or ownership proof is claimed. No wallet secrets are requested. The existing EarthChain test wallet is linked, not connected. Its current protocol accepts only FAUCET/TRANSFER and cannot atomically buy an NFT. The explicit EarthChain purchase adapter fails closed.

## Required next integration

Implement in canonical Sovereign-Core EarthChain, then consume from Portal:
- Versioned collectible metadata and unique item IDs bound to a game and immutable content hash.
- Authoritative owner/supply records and authenticated wallet ownership challenges.
- Signed purchase intent binding network, buyer, seller, item, exact price, nonce, expiry and prior state.
- Atomic debit/credit/ownership transfer, duplicate-intent idempotency, replay rejection, and stale-owner checks.
- Independent receipt verification before granting equipment. Explicit pending/failed/confirmed states, including recovery after interrupted submissions.
- Test two actual devices and reject tampered, replayed and wrong-network receipts. A local completion flag must never authorize a valuable reward.
- Start with valueless collectible test transactions; enable real purchases only after the actual settlement system exists and is verified.

Do not force this into the existing two-party transfer schema or infer NFT ownership from a transfer-only receipt. Marketplace resale and cross-game compatibility remain future capabilities.

## Validation

`node --test games/starfall/economy.test.mjs`

Syntax checked for game and economy modules. Automated tests cover shop locks, funds, duplicate purchases, owned-only equipment, invalid saves, and unavailable settlement. Real iPhone interaction and rendered gameplay have not been verified in this environment.
