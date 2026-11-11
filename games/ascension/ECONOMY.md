# ASCENSION EarthChain collectibles and economy

Status: **catalogue and policy scaffold committed; not minted, not purchasable yet, and not live on-chain.**

## Player-facing promise

ASCENSION uses the existing Portal EarthChain identity and wallet. It does not create a second wallet or a parallel token ledger.

- Earnable collectibles reward verified accomplishments: four boss seals, campaign completion, and verified relic milestones.
- Limited drops are collectible cosmetics with explicit edition caps.
- Every asset is cosmetic/identity only. Damage, armor, boost, pulse, and score multipliers remain zero. No pay-to-win and no gameplay-stat advantage from owning or buying an NFT.
- Prices are not hardcoded into game metadata. Each sale must present an issuer-signed quote with exact network, asset, buyer, seller, amount, expiry, and nonce before the wallet signs.

## Catalogue source

collectibles.mjs is the canonical ASCENSION catalogue v1. It defines three earnable items and three limited drops, immutable game/token identity, visual slot/accent metadata, and an explicit no-advantage policy. collectibles.test.mjs verifies unique IDs, metadata binding, zero gameplay modifiers, limited-edition caps, and rejection of altered entries.

This is a catalogue, **not an NFT contract or proof of issuance**. The catalogue does not mint tokens, create orders, prove a player completed a run, or grant ownership.

## Existing EarthChain foundation

The Portal already has:
- one existing encrypted EarthChain test wallet;
- a pinned signed ECTEST commerce coordinator;
- signed purchase requests, exact-term purchase receipts, idempotent retry/recovery, and metadata-bound Starfall test collectibles;
- a canonical Sovereign-Core signed-exchange test engine with issuer-authorized test minting and full journal replay.

These are useful foundations, but the current hosted commerce service is a centralized, valueless test network. The local signed-exchange engine is not deployed, is not a distributed chain, and is not a live asset network. Existing Starfall test collectibles are not automatically ASCENSION collectibles.

## Required implementation before a playable NFT economy

1. **Catalog/issuer parity:** register the six ASCENSION metadata records in the trusted issuer's allowlist and bind every mint to the canonical metadata digest and edition cap.
2. **Purchase flow:** add ASCENSION offers to the existing signed ECTEST coordinator (or its successor), reuse the existing wallet, and show a review screen before signing. Never accept a client-supplied price or seller.
3. **Earned reward verification:** replace client-trusted height/relic/score claims with deterministic server-side replay verification from recorded player inputs and a versioned game build. Bind a fresh signed wallet challenge to the verified player before issuing. Deduplicate achievement IDs and event IDs transactionally.
4. **Ownership/equipment:** verify the current signed ownership projection and metadata hash before equipping. Transfers must move cosmetic entitlement to the new owner after a fresh ownership refresh.
5. **Live-chain gate:** a real EarthChain NFT release needs the canonical network's actual transaction/consensus and finality interface, durable issuer authority, supply enforcement, key recovery, independent verification, security review, and explicit deployment approval. ECTEST receipts must never be displayed as public-chain transactions.

## Security invariants

- A local high score, browser storage value, friend-run upload, or client boolean is never mint authority.
- Limited supply is enforced by the issuer/ledger transaction, not the browser.
- An identical retry returns the original receipt; it never charges twice.
- No new wallet, duplicate inventory, private-key upload, or client-controlled issuer.
- No NFT grants combat power or ranking advantage.
- Public metadata contains no personal information.