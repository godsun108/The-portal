# Cross-platform checkout plan — no live payments
Portal Exchange should support responsive iPhone Safari, Android Chrome, and desktop browsers with the same backend ledger, reconciliation and receipt model.

| Method | Proposed route | Status |
|---|---|---|
| Apple Pay | Approved payment/crypto provider that explicitly supports EC | Research only |
| Google Pay | Approved payment/crypto provider that explicitly supports EC and eligible Android/browser/device | Research only |
| Cards | Provider-hosted card checkout, with explicit token-sale approval | Research only |
| Bank | Regulated bank transfer/onramp and settled funds confirmation | Research only |
| PayPal | Only if PayPal and provider explicitly approve EC token purchase; may be unavailable | Under evaluation |
| XRP | Approved quote, liquidity, wallet authorization and verified chain settlement | Research only |

Apple Pay and Google Pay are wallet payment interfaces, not proof of cryptocurrency-sale eligibility. PayPal availability for ordinary goods does not establish eligibility to sell a proprietary token. Display only methods available to each user, jurisdiction, browser and approved provider. No method should create EC credit from a browser callback.

All flows require: authenticated server session, signed executable quote, fee disclosure, KYC/AML and sanctions controls as applicable, payment authorization, verified settlement, chain delivery, idempotent balanced journal posting, receipts, disputes/refunds and recovery. No live provider integration or purchases are implemented.
