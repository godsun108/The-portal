# EarthChain TruFusion recovery map — 2026-10-25

## Source verified (not just conversation recollection)

- `godsun108/Sovereign-Core`, branch `genesis/evolution-lab-foundation`, `earthchain/trufusion/README.md`: AI advisory + quantum-inspired optimization + verifiable ledger architecture; explicitly no claimed quantum hardware, quantum speedup, or public consensus.
- `godsun108/Sovereign-Core`, same branch, `earthchain/trufusion/orchestrator.mjs`: `propose()` validates the local ledger, binds request and actor/action to the current ledger head, and creates a content-hashed proposal; `verifyProposal()` checks proposal digest and head. Both keep authority advisory-only and require separate signed authorization.
- `godsun108/Sovereign-Core`, same branch, `earthchain/ledger.mjs`: LOCAL_TEST_ONLY deterministic ledger.
- `godsun108/The-portal`, `earthchain-test/`: ECTEST signed wallet/journal and two-party acknowledgements, not public consensus.

## Recalled historical work, not yet source-verified

Q-Bridge, VictoryChain, AEGIS-Q, Sovereign Q-Lab, and Tri-Fusion were discussed in prior project work. Their exact active source paths, test evidence and deployed status remain unverified. GitHub code search indexes default branches and may miss work on other branches. Do not report these as deployed, secure, or production-ready until inspected.

## Correct separation of capabilities

1. **Quantum-inspired computation:** optimization run on classical hardware; no quantum advantage claimed.
2. **Post-quantum cryptography:** independently evaluated signature/KEM migration, with interoperability and key-management review; no claim that classical Ed25519 signatures are quantum-resistant.
3. **Native EarthChain consensus:** deterministic state machine, distributed validators, independent quorum/inclusion/finality proofs, networking and fork handling; not provided by TruFusion proposals.
4. **USD/EC exchange:** payment-provider settlement, verified native delivery, licensing/compliance and reconciliation; disabled until approved.

## Integration boundary

TruFusion's proposal digest and ledger-head binding are useful for auditable *advice*. Do not turn its advisory output into a validator vote, cryptographic finality proof, authorization, coin issuance or exchange settlement. First prove signed intent, policy checks and independent finality on a non-monetary multi-node test network.

## Next actions

Inspect branch-specific files for Q-Bridge, VictoryChain and AEGIS-Q; recover their tests and crypto dependencies. Audit TruFusion proposal canonicalization and stale-head rejection. Add a separate offline testnet for signed blocks and quorum verification; never silently upgrade ECTEST to real EC.
