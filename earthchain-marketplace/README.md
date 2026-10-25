# EarthChain Marketplace: valueless coin-first demo
This is an isolated in-memory **ECTEST** prototype, not real EARTH, USD purchase, custody, blockchain settlement, escrow, or shipping verification. No payment processors or networks are contacted.

Flow: acquire simulated credits -> list Yu-Gi-Oh card -> buyer approves ECTEST purchase -> test hold -> mark shipped -> approve simulated release to seller. Seller may reuse their ECTEST in further simulations.

Run `node --test earthchain-marketplace/simulator.test.mjs`.

Production blockers: licensed fiat-to-EARTH purchase route, token issuance and custody, sanctions/KYC/AML review, consumer protection and refunds, dispute deadlines, reliable shipping confirmation, seller authorization, atomic persistent accounting, immutable journal, idempotency tied to request payload, independent security review. The in-memory demo is not safe for live money.
