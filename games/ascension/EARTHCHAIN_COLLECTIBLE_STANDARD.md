# ASCENSION — EarthChain Collectible Standard (Design v1)

Status: DESIGN + INTEGRATION. ASCENSION consumes the existing Starfall EarthChain signed test-wallet ownership projection for approved cosmetic crossover display. This is not a new minting implementation. ASCENSION-native earned issuance remains gated on authoritative result verification and the trusted issuer.

## 1. Product rules
- ASCENSION supports both gameplay-earned collectibles and curated limited releases.
- The game remains fully playable without a wallet. Wallet connection is optional and unlocks verified collection display and eligible cosmetics.
- No pay-to-win: collectible ownership never grants score, damage, health, speed, drop-rate, or competitive advantage.
- No purchase is required to finish a campaign, compete, or earn baseline rewards.
- A collectible is not an investment promise. No appreciation, yield, or guaranteed resale claims.

## 2. Initial collection families
| Family | Examples | Initial utility |
|---|---|---|
| Warrior identity | Armor pattern, helmet, visor treatment, insignia | Cosmetic character appearance |
| Equipment appearance | Weapon shell, jetpack shell, exhaust effect | Cosmetic-only visual variant |
| Relics | Ancient seals, recovered artifacts, world discoveries | Collection display; lore |
| Legacy marks | Campaign clear, boss victory, season challenge | Achievement display; optional cosmetic badge |

Gameplay statistics remain identical across cosmetic variants.

## 3. Rarity and supply
Use five presentation tiers:
- Standard — unlimited or ordinary gameplay availability.
- Uncommon — gameplay-earned, repeatable under published rules.
- Rare — finite season or challenge collection.
- Epic — tightly limited event collection.
- Relic — individually numbered, one-of-one story/artifact release.

Rarity is descriptive scarcity, not power. Each finite release must publish its supply cap, eligibility, claim window, and whether unclaimed supply expires or remains unissued before the event begins. Never silently increase a published cap. Do not imply scarcity for unlimited assets.

## 4. Acquisition paths
### Earned
- Campaign milestones, boss clears, exploration, verified challenges, and season achievements.
- Valuable/finite awards must originate from trusted, replay-verified game events, not browser save data or client-submitted score JSON.
- Duplicate event delivery must not issue duplicate assets.

### Curated drops
- Limited art/season collections with transparent eligibility and published supply.
- If random selection is ever used, disclose odds and rules before participation. Initial design should prefer deterministic, auditable eligibility over paid randomized loot.
- No paid random loot boxes in the initial release.

## 5. Canonical asset record
Every collectible must have:
- schemaVersion
- collectionId
- gameId = ASCENSION
- assetId (stable unique identifier)
- displayName, description, family, rarity
- contentHash for the canonical metadata and artwork package
- artworkVersion and provenance/license record
- supplyPolicy (unlimited, capped, or unique) and published cap when finite
- acquisitionPolicy and campaign/season/event reference where applicable
- cosmetic slot and visual parameters; no gameplay-stat fields
- issuer identity and issuance-policy version

Metadata must not contain private keys, wallet secrets, passwords, recovery data, or unnecessary personal information. A metadata example is a schema fixture, never proof that a token was minted.

## 6. Wallet and ownership trust
- Use the existing EarthChain wallet and canonical EarthChain identity/ledger pathways; do not create a parallel game wallet.
- Wallet possession must be proven with a fresh signed challenge bound to the intended audience/origin, network, wallet public identity, nonce, and expiry. Never trust a client-supplied wallet address or verified boolean.
- The game receives a short-lived, scoped ownership/entitlement proof from a trusted verifier. It must validate network, asset ID, current owner, issuer, metadata hash, expiry, and revocation/status.
- Refresh proof on game launch, wallet switch, asset transfer, revocation, and proof expiry. If proof cannot be refreshed, show the default cosmetic; never infer ownership from local storage.
- Wallet/NFT ownership is not EarthID authentication and must not grant login or account-recovery authority.

## 7. Issuance and transfer safety
Trusted issuance pipeline:
1. Accept only authoritative, replay-verified game award events.
2. Verify player-to-wallet binding using a fresh signed wallet challenge.
3. Enforce durable uniqueness for (gameId, eventId, rewardSlot) and reserve the asset/token identifier atomically.
4. Enforce the published supply cap and intended recipient.
5. Create an idempotent issuance intent and submit through the approved canonical EarthChain issuance pathway.
6. Verify the independently returned ledger receipt and final owner before showing the asset as confirmed.
7. Recover interrupted/pending submissions without double-issuing.

Transfers must update authoritative current ownership atomically and preserve immutable historical award attribution. The original award recipient remains in achievement history; the current owner receives any transferable cosmetic entitlement only while ownership is verified.

No game-side module may mint, sign, or grant its own authority. Client code is presentation and request initiation only.

## 8. Marketplace and economy boundary
- Initial release: no marketplace and no real-money checkout.
- Do not force NFT ownership into the existing two-party FAUCET/TRANSFER-only wallet protocol or treat an ordinary transfer receipt as proof of NFT ownership.
- Marketplace purchase/resale requires a separately reviewed atomic settlement primitive binding network, buyer, seller, asset, exact price, nonce, expiry, and prior ownership state; it must be replay-safe and recoverable.
- Earthcoin pricing, fees, refunds, and resale rules remain out of scope until canonical ledger support and explicit product/legal review exist.

## 9. Delivery phases and gates
1. Prototype: local, clearly labeled non-chain mock collection data; no wallet dependency.
2. Read-only wallet proof: connect existing test wallet; verify test-network ownership; no minting or purchases.
3. Earned test issuance: valueless test collectibles from authoritative award events; two-device, replay, duplicate, wrong-network, tamper, transfer, revocation, and interrupted-recovery tests.
4. Cosmetic entitlement: equip only while current ownership proof is valid; default fallback on expiry or transfer.
5. Limited drops: publish caps and rules; durable claim registry; auditable issuance.
6. Marketplace: separate approval after atomic NFT settlement and security review.

No phase is considered complete based only on UI appearance. Require tests and independently verified ledger evidence. Production activation, real-money activity, and changes to canonical wallet/ledger authority require separate explicit approval.

## 10. Acceptance criteria
- Offline/no-wallet play remains complete.
- Browser edits, forged awards, replayed events, duplicate requests, expired challenges, wrong-network receipts, tampered metadata, and stale ownership are rejected.
- Concurrent claims cannot exceed supply or issue twice.
- Transfer changes current cosmetic entitlement without rewriting award history.
- Missing/expired verifier proof fails closed to standard cosmetics.
- No secret material leaves the existing wallet boundary.
- iPhone performance and wallet-switch/reconnect behavior are tested before release.

## Existing Starfall wallet reuse (implemented client adapter)

- Reuse the existing `earthchain.starfall.hosted.v1` signed view and `earthchain.no-server.v1` wallet address from the same-origin Portal wallet.
- Pin verification to the existing Starfall hosted checkout configuration and verify the signed view, expiry, rollback guard, network, current wallet address, metadata hash, and Starfall ownership projection using the existing commerce module.
- Only mapped Starfall assets receive visual crossover treatments in ASCENSION. The original asset remains a Starfall collectible; this adapter does not relabel it as an ASCENSION-native token.
- No private key, password, bearer token, wallet unlock, purchase, or mint operation is performed by ASCENSION.
- Any missing, stale, invalid, or mismatched proof fails closed to standard armor.
- ASCENSION-native rewards remain separate and require trusted server-side replay validation plus issuer-side idempotency before issuance.
