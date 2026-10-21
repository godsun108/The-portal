# World Record Award → Existing Collectible Issuer Bridge

The bridge in `games/starfall/champion-issuer-bridge.mjs` maps a trusted Starfall record award event to the **existing signed ECTEST collectible metadata** consumed by `starfallSkins` and `verifiedTestSkin`. This avoids creating another skin inventory.

The output is a **pending issue intent**, not an issued collectible. No new wallet, token, signature, API, or live minting has been deployed.

Security prerequisites for the eventual trusted issuer:
- Accept world-record events only from authoritative replay-verified scoring, not from browser or unsigned JSON.
- Validate player-to-wallet binding using a fresh signed wallet challenge and authenticated EarthID.
- Transactionally deduplicate the record event ID, reserve the token ID and verify the intended recipient before signing a collectible issuance.
- Use the existing coordinator's approved signed issuance pathway and preserve its pinned verification, hash checks and expiry.
- A boolean `verifiedAward` or `verifiedWalletBinding` supplied by an untrusted client is **not proof**. These parameters are reserved for a trusted internal caller.
- Persist issuance and retry safely. Never award from local Starfall personal bests.
- The real blockchain NFT mint path remains separate and requires explicit consent and review.

Test: `node --test games/starfall/champion-issuer-bridge.test.mjs`. Tests committed but execution not yet verified.
