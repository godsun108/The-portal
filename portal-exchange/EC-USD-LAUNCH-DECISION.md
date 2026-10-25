# EarthCoin USD acquisition: network decision gate

Status: RESEARCH / NO LIVE FUNDS / NO ISSUANCE AUTHORIZED.

## Verified from PORTAL development branch
- `portal-exchange/ec-usd-acquisition.mjs` calculates illustrative USD-to-EC amounts, with payment and delivery disabled.
- `portal-exchange/earthwallet-commerce-demo.mjs` exposes only simulated wallet balances.
- No production chain deployment, contract address, genesis hash, explorer evidence, or exchange-provider approval has been established by this review.
- Absence of evidence in this review is not proof that no other EarthChain repository contains a candidate chain.

## Decision required before accepting dollars
1. Choose **native EC network** versus **EC token on an established chain**. Neither is selected by this document.
2. Record chain/network ID, token/asset identifier, decimals, issuance authority, total-supply policy, explorer link, signed test transaction, and independent ownership verification.
3. Record legal assessment of EC distribution and US money-transmission / securities / consumer protection implications, including state requirements.
4. Select a regulated or appropriately licensed fiat payment/conversion provider; Circle USDC infrastructure alone does not establish EC liquidity or EC purchase support.
5. Design an auditable inventory ledger, fiat payment state machine, chargeback policy, delivery confirmation, refunds, reconciliation, rate expiry and transparent fees.
6. Require independent authorization and end-to-end test evidence before any live enablement.

## Candidate deployment strategies (not approved)
- Native EarthChain: preserves native-coin vision, but demands validator, custody, bridge, explorer, security and operational maturity.
- Token on existing network: easier early interoperability, but creates a token rather than a native EarthChain coin; migration and governance must be disclosed.
- A partner-managed distribution: only if a provider explicitly supports EC and onboarding requirements are met.

## Zero-spend milestone
Build a simulated payment-intent state machine with idempotent provider event handling and irreversible EC delivery only after independently verified settled funds; model chargebacks, duplicate events and failed delivery. No API keys, secrets, live payment requests, or issuance.
