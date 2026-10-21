# EarthPlay Champion Token → Exclusive Skin

Status: DESIGN / PURE POLICY CODE ONLY. No NFT network, mint, trusted issuer, or entitlement integration deployed.

- A verified world record event may become a World Record Legacy collectible.
- The **original champion** stays credited in the permanent achievement history.
- The **current token holder** may equip a game-specific cosmetic while verified ownership remains current. Transfer moves the cosmetic entitlement; it does not rewrite the record's historical champion.
- Starfall concept: **Celestial Crown**, a gold-and-cosmic-blue championship hull with radiant trail.
- Cosmetics confer no score, damage, currency, speed, or gameplay advantage.
- Every game may have its own design and season variant; metadata must identify the game, record event, and collection.
- The existing Starfall ECTEST equipment verification path must remain separate. Never treat a client-supplied `verifiedByTrustedService` boolean as authentication.
- `champion-cosmetics.mjs` is a pure eligibility policy only. A trusted service must verify token contract/network, token ownership, issuer signature, expiry, revocation, and wallet/session binding **before** invoking it. The module itself is not safe as a public authorization endpoint.
- Refresh entitlement on launch, wallet switch, transfer, revocation and proof expiry; fall back to a standard skin when ownership is no longer verified.
- Never require a purchase to compete or obtain a record. No automatic mint fees, no financial claims.
- Before activation: verify authoritative world-record pipeline, durable claim registry, genuine token ownership source, privacy-preserving EarthID binding, and independently tested game integration.

Run policy tests: `node --test games/starfall/champion-cosmetics.test.mjs`.
