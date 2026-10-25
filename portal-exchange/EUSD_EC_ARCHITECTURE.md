# eUSD + EC phased architecture (research / demo)
## Phase 1 — eUSD accounting
- `eUSD_DEMO` represents illustrative dollar-denominated **cents**, never customer deposits, an entitlement to dollars, or an issued stablecoin.
- `EC_DEMO` represents separate valueless test units, **not** EARTH or a tradeable token.
- Do not accept money into a proprietary eUSD wallet or credit user funds until a regulated partner, ledger reconciliation, payment authorization and consumer-protection model have been approved.
- Real Stripe charge/payout status must only be consumed from verified server-side webhooks and reconciled; no browser-generated monetary credits.
- Use separate internal account and asset identifiers. Never assume eUSD/EC exchange parity, rate, convertibility or liquidity.

## Phase 2 — partner-issued on-chain eUSD
- Evaluate approved issuance/redemption provider, eligible jurisdictions, backing, reserve attestations, identity and sanctions controls, on-chain network, wallet UX and redemption rights.
- Do not self-issue or claim dollar redemption before partner agreement and legal approval.
- Integrate a signed quote and transaction settlement verification before changing a user-visible balance.

## EC token
- Define actual network, contract, supply, tokenomics, regulatory treatment and audited security.
- Evaluate onramp availability and XRP liquidity separately. Stripe onramp support for crypto generally does not establish support for proprietary EC.
- Marketplace purchases require real identity/ownership checks and independent buyer/seller authorization. Self-purchase remains prohibited in the current simulator.

## Existing repo relationships
- `portal-exchange/index.html` is a non-transactional preview from the parent branch.
- `earthchain-marketplace` ECTEST simulation is a separate unmerged PR (#301).
- This branch does **not** connect live Stripe or credit any real user wallet.

## Stripe inspection (2026-10-25)
Connected Stripe account: Nicholas Grant Kramer Corp, **live-mode context**. Read-only account discovery and public documentation search were performed. No account writes, products, charges or payouts.
Stripe documentation reviewed:
- https://docs.stripe.com/crypto/onramp/embedded-overview
- https://docs.stripe.com/stablecoins/availability
- https://docs.stripe.com/stablecoins/ecosystem
These describe potential provider infrastructure, **not** eligibility or approval of proprietary EC/eUSD for this account.
