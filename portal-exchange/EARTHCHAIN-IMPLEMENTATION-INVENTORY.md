# EarthChain historical implementation inventory — 2026-10-25

## Verified source locations

1. **godsun108/Hemp-Token** — README.md: historical Python blockchain experiments with SHA-256 blocks, proof-of-work nonce search, and transaction class examples. Educational prototype, not production consensus.
2. **godsun108/Sovereign-Core** — branch `genesis/evolution-lab-foundation`, `earthchain/ledger.mjs`: deterministic `LOCAL_TEST_ONLY` event ledger with faucet, transfers, collectible mint and transfer, replay-based state verification. Not signed validator consensus.
3. **godsun108/The-portal** — `earthchain-test/protocol.mjs`, `wallet-crypto.mjs`, `mutual-ledger.mjs`: signed ECTEST transactions, encrypted wallet backup, two-party acknowledgement. Two-party mutual finality is not public network consensus.
4. **godsun108/The-portal** — `portal-exchange/`: USD/EC simulation, receipt contract, fail-closed validator adapter.

## Architecture decision

Native EC must be a coin of an independently verified EarthChain network. Do not confuse Hemp-Token proof-of-work example, LOCAL_TEST_ONLY ledger, ECTEST, or a mock receipt with native EC settlement. Reuse tested cryptographic primitives only after threat modeling and audits.

## Remaining proof

Find or build independently operating nodes, deterministic consensus and canonical block format, genesis/chain identity, validator-set changes, quorum and slashing/fork rules, cryptographically verified inclusion and finality, peer networking, persistent ledger, issuance schedule, wallet integration and operational security. Payment conversion additionally requires approved provider and compliance controls.

## Safe next engineering milestone

Build an **offline multi-validator consensus prototype** in an isolated test network with deterministic genesis, signed blocks, quorum validation, transaction inclusion proofs, adversarial tests and no economic value. Only after verifying the actual consensus implementation should `ec-native-finality-adapter.mjs` connect to it. Keep fiat and native EC delivery disabled.
