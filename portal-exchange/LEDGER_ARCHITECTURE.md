# EarthChain Ledger Core — prototype boundaries
Logical subsystems:
1. Financial double-entry journal: eventual provider-reconciled fiat/stablecoin obligations and refunds.
2. Token journal: EC, SOIL and STEWARD units, issuance, transfers, treasury and burns.
3. Stewardship registry: evidence references, claims, independent review, approved reward linkage.
4. Marketplace journal: order authorization, escrow/holds, fulfillment, disputes and settlement.
5. Append-only audit/event journal: actor, timestamps, evidence hashes, approvals, provider references and idempotency keys.

`ledger-core.mjs` is a **valueless in-memory simulation** only. `ISSUER` is a demo counter-account and may go negative by design; it is not a reserve or an actual issuer. STEWARD_DEMO is not a real token and claims are not independently verified by software. Reviewer separation is a rudimentary check, not identity verification. No exchange rate, cash value, redemption, custody, on-chain settlement, Stripe interaction or marketplace integration.

Before production: persistent transactional database with atomic posting, strict unique constraints, per-asset balanced accounting, reconciliation to external settlement providers, immutable evidence hashes, authentication/authorization, independent reviews, dispute and reversal entries, clock-stamped audit events, rate limits, security review, migrations, property-based/concurrency tests, backup and recovery. Never use the in-memory module to hold or represent real funds. Separate token minting authorization from ordinary user actions.

Run tests from repository root: `node --test portal-exchange/demo-ledger.test.mjs portal-exchange/ledger-core.test.mjs`. Tests have been authored but have not yet been executed in CI.
