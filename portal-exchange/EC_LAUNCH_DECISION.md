# EC launch decision record — draft for qualified review

## Decisions required before genuine EC exists
- **Purpose:** decide whether EC is a consumptive utility token, a payment instrument, an investment product, or another category. A label does not determine legal treatment. Define actual rights, marketing, transferability and governance.
- **Network:** compare an existing supported chain vs XRPL issued assets vs other EVM networks. Select only after wallet, provider and liquidity compatibility is demonstrated. No contract or XRPL issuer account is authorized here.
- **Supply and governance:** max supply, initial allocations, vesting, treasury controls, multisignature issuance, mint/burn authority, recovery and upgrade policy. No invented supply or price.
- **Wallet:** self-custody vs approved custodial model, chain verification, key management, recovery, signing prompts and audit.
- **Payment:** Apple Pay, Google Pay, cards, bank, PayPal and XRP each require **specific** provider support for this token and jurisdiction; ordinary merchant payment processing is not sufficient.
- **Settlement:** verify payment finality, token delivery, fees, reconciliation, disputes and refund handling. A successful browser checkout never directly credits EC.
- **Compliance:** counsel to analyze US federal and Florida law, securities/commodities issues, money transmission, sanctions, AML/KYC, tax, consumer protection and disclosures. Obtain required registrations or approvals before selling.

## Launch release policy
The static preview and demo ledger must remain disconnected from live funds. `launch-gates.mjs` records research evidence but **cannot** approve launch or turn on payments. Production go-live requires independent legal, security, financial and provider sign-off plus explicit human authorization. No real EC can be purchased at this milestone.

## Next concrete external decisions
1. Commission qualified legal review or identify a regulated partner that explicitly supports EC issuance and sale.
2. Obtain written provider confirmation for each desired funding method and actual token/network.
3. Choose network only after provider compatibility and wallet security feasibility are verified.
4. Audit and test production implementation and reconcile provider/chain transactions in a transactional ledger.
