# Apple Pay acquisition pathway — planning only
Apple Pay is a payment authorization method, **not** a cryptocurrency issuer or exchange. EC purchases require an approved provider willing and permitted to sell/deliver the actual EC asset, as well as an issued token, pricing/liquidity, KYC/AML as applicable, customer disclosures, verified settlement and wallet delivery.

## Proposed flow
1. Server confirms eligibility, region, wallet readiness and supported provider.
2. Server obtains time-limited executable quote (EC quantity, fiat total, spread, network fees, expiry).
3. Approved provider creates a payment session; Apple Pay is shown only when available and authorized on the device/browser and domain.
4. Customer authorizes through Apple Pay; browser success alone never credits EC.
5. Server verifies provider-signed events, actual settlement and token transfer/chain finality, then reconciles balanced journal entries.
6. Idempotent retries, refunds/failed fulfillment, disputes, and support paths are required.

## Release gates
- Legal assessment of EC issuance/sales, money transmission, digital assets and consumer protection in applicable jurisdictions.
- Explicit provider support for this specific EC asset and Apple Pay purchase use case; Stripe account connectivity alone does not establish eligibility.
- Verified Apple Pay domain and provider configuration, if applicable; use provider-hosted payment UI where possible.
- Security, fraud prevention, rate limits, audit logs, reconciliation, refund policy, incident response and independent testing.
- Never collect or store raw card details, Apple Pay tokens, wallet seed phrases, or credentials in the static preview.

Current implementation: **informational dropdown only**, no Apple Pay API, no provider sessions, no live charges, no real token issuance or delivery.
