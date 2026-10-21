# PORTAL Genesis Passport — EarthChain Wallet Welcome Collectible

Status: DESIGN / NO MINTING ENABLED. Zero-new-spend policy.

## Product intent
A user who creates an EarthChain wallet through THE PORTAL may claim one unique PORTAL Genesis Passport collectible for that wallet after wallet ownership is proven. The passport celebrates early membership and can be displayed in EarthPlay, EarthID profiles and the EarthChain Observatory.

## Important distinctions
- The existing no-server wallet uses valueless ECTEST, local encrypted wallet material and signed public ledger files; it is **not** a deployed public blockchain or real NFT network.
- An illustration or locally stored JSON badge is not an NFT. Call it a **test collectible** until a genuine token contract and consensus-backed ownership exist.
- Wallet possession does not establish a unique human. One-per-wallet is possible; one-per-person requires separately reviewed identity and abuse controls.
- The passport is NOT an authentication credential, proof of legal identity, monetary asset, investment, or a key to recovering the wallet.
- Do not expose private keys, passwords, account recovery data or identifying personal information in token metadata.

## Proposed immutable claim record
```json
{
  "schema": "earthchain.portal-genesis-claim.v1",
  "campaign": "portal-genesis",
  "walletPublicId": "<public wallet address>",
  "claimNonce": "<server-issued unique nonce>",
  "metadataDigest": "<sha256 of immutable artwork and metadata>",
  "issuedAt": "<server verified timestamp>",
  "claimSignature": "<wallet signature over canonical claim challenge>"
}
```
The record above is a **schema example**, not a minted token.

## Trust and safety gates
1. Confirm wallet creation or restoration using a fresh challenge signed by its key; never trust a client-supplied address.
2. Enforce atomic uniqueness on `(campaign, walletPublicId)` in trusted durable storage; reject replay and concurrent duplicate claims.
3. Verify the challenge domain, origin, nonce, expiration and wallet signature; bind claim to correct network and token contract.
4. Allow recovery/transfer policy to be explicit. A transferred NFT must not confer EarthID login rights.
5. Use nontransferable test badge for pilot, or document transfer policy for actual NFT; no silent financial value claims.
6. Publish verifiable mint receipts and contract address only once real deployment is reviewed and authorized.
7. Avoid automatic network transaction fees; require clear opt-in if minting incurs gas or any other cost.

## Suggested creative metadata
Collection: PORTAL Genesis Passports
Symbol: PGP (proposal; collision check required)
Visual: luminous gateway, animated Earth and unique generative color geometry.
Attributes: genesis edition, portal origin, visual variant, founding season.
No private player details or wallet secrets in metadata.

## Staged implementation
- Phase A: visual passport preview, test-only claim receipt and tests.
- Phase B: connect authenticated, idempotent wallet ownership claims to an approved existing backend.
- Phase C: optional real NFT mint on a reviewed network, with explicit user consent and cost disclosure.
- Phase D: EarthPlay cosmetics and EarthChain Observatory view using verified token ownership, without treating NFT ownership as login.

## Pages launch blocker
EarthPlay Arena path exists in the main branch at `earthplay-arena/index.html`, but the user reports HTTP 404 at the GitHub Pages URL. The repository commit alone does not prove successful Pages deployment. Check repository Settings → Pages for publish source and GitHub Actions for latest Pages deployment before asserting the URL is live. Do not fix by blindly changing publishing configuration.
