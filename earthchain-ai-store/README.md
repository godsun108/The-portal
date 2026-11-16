# EarthChain AI Store — isolated demo
Prototype catalog and deterministic **valueless** ECTEST order simulation. This is not connected to the Starfall coordinator, real wallets, financial accounts, or deployed marketplace. No AI executes and no permissions are granted. The simulated journal is not a production double-entry ledger.
Run: `node --test earthchain-ai-store/test-commerce.test.mjs`.
Before any integration: validate real authorization server-side, bind order IDs to buyer and immutable cart contents, implement persistent atomic idempotency, payment-provider settlement, refund logic, and agent sandbox policy. Never interpret test credits as redeemable EarthCoins.
