# EarthChain sovereign-network and treasury architecture — proposal, NOT launch authorization

## 1. Network
EarthChain shall own its protocol, validator specification, governance, and independent testnet. Start with deterministic, offline simulated state transitions and multiple independent validators on a local testnet. Do not describe a single-server ledger as a decentralized chain. Production consensus, Sybil resistance, networking, finality, upgrades, key recovery, forks, security audit, bridge design, and validator incentives remain unimplemented. No mainnet or transferable token exists.

## 2. Asset separation
- **EC**: proposed native network asset. Supply, rights, distribution, pricing, and redemption rights UNDECIDED; no real issuance.
- **eUSD_DEMO**: test accounting only. If future eUSD is pegged to USD and redeemable, it may be a regulated payment stablecoin requiring permitted issuance and eligible 1:1 reserves. Do not issue a live eUSD.
- **STEWARD_DEMO**: test ecological recognition only, not withdrawable money.

## 3. Proposed legal entities and fiduciary roles (subject to legal advice)
- **EarthChain Foundation / Trust** (working title): mission governance and oversight. Trust instrument, trustees, beneficiaries, fiduciary powers, jurisdiction and independence must be determined by qualified counsel. A trust is NOT a banking or money-transmitter license.
- **Customer safeguarding entity / qualified custodian**: separate legal ownership, beneficial interests, insolvency treatment, account titles, authorized signers, custody agreements and reconciliation. Prefer regulated partner for actual custody. Do not assume a generic trust account protects every user or confers FDIC coverage.
- **EarthChain Operating Company**: development, services and explicitly earned fees only. No authority to spend customer balances.
- **Independent oversight**: trustee/board and independent audit; dual-control approvals, conflict-of-interest and related-party rules. Founder salary and fees must be pre-agreed, disclosed and recorded.

## 4. Mandatory money flow
Customer -> regulated provider -> properly titled segregated safeguarding account / qualified custodian -> authenticated customer liability ledger -> authorized withdrawal to customer. Provider settlement and bank balances are verified off-chain; chain records alone cannot prove fiat exists.
Operating revenue is posted ONLY after the fee is earned, disclosed, and reconciled. Treasury funds must never pay payroll, network expenses, investments, founder distributions, or operating shortfalls.

## 5. Financial invariant
At all times: independently confirmed eligible safeguarding assets >= total customer redeemable liabilities + pending withdrawals + applicable unsettled/refund obligations. Evaluate by asset/currency; never substitute volatile EC or XRP for a USD liability at face value. Halt withdrawals/issuance on shortfall, do not conceal shortfall. Reserve requirements may be stricter by law. For payment stablecoins, legally prescribed 1:1 reserves and permitted issuer requirements control.

## 6. Transaction control
Immutable append-only journal with transaction IDs, double-entry accounting, idempotency, verified bank/provider settlement, authorized customer instructions, multisig/threshold approval where appropriate, daily reconciliation, external audits, refund/dispute processes, fraud/AML/sanctions screening as required. Production architecture needs persistent transactional storage and independent audit.

## 7. Legal launch blockers
US FinCEN money transmission analysis; Florida Chapter 560 intermediary/custody scope and licensing; GENIUS Act if any redeemable fixed-value stablecoin; SEC/CFTC analysis of EC rights and marketing; consumer protection, tax, privacy, payments, banking and custody contracts. Obtain qualified counsel and provider approvals. No deposits, live exchange, issuance, or advertising as a licensed custodian until verified.

## 8. Zero-spend milestones
A. Offline chain simulator and adversarial invariant tests.
B. Simulated treasury ledger, segregation and withdrawal queue tests.
C. Public protocol and governance draft, independent validator participation plan.
D. Legal/provider decision package and cost assessment.
E. ONLY AFTER authorizations, security audits and partner agreements: live integration.
