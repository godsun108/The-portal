# Champion collectible → existing Starfall skin pipeline

The existing signed ECTEST coordinator view, pinned key, wallet ownership check and equipment selection are reused. No parallel inventory or wallet system.

Test-only champion token ID convention: `starfall-champion-<season>-<recordSequence>`, e.g. `starfall-champion-pilot-1-42` (season is parsed greedily). The metadata hash must match canonical:
```json
{"schema":"earthchain.game-collectible.v1","gameId":"starfall","skinId":"starfall-celestial-crown","tokenId":"starfall-champion-pilot-1-42","testOnly":true,"achievement":"world-record-legacy","season":"pilot-1","recordSequence":42}
```
The existing `starfallSkins` checks signed projection ownership and metadata digest. `verifiedTestSkin` still checks pinned coordinator signature and expiry; it can select this skin through the existing `preferredToken` selection. The Starfall renderer now draws a Celestial Crown hull with cosmetic-only gold/blue visuals. If no valid signed test ownership exists, no champion hull is unlocked.

**No champion collectible has been issued, no world-record backend is deployed, and this is not a real blockchain NFT.** The design only enables future *properly issued* signed test collectibles to use the existing game skin pipeline. An authoritative score verifier and award issuer must be added before issuing any champion token. This integration has not been device-smoke-tested. Do not mint from client-side scores.
