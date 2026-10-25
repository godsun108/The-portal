# EarthChain Quantum Genesis — security architecture v0.1

Status: DESIGN ONLY. No post-quantum cryptography is implemented or certified in the running EarthChain prototype.

## Threat model
A cryptographically relevant quantum computer could break the Ed25519 signatures currently used in the offline laboratory. Network confidentiality can also face harvest-now-decrypt-later risk. Hashes remain useful, but security margins and hash lengths require protocol review. Quantum computing is not required to run post-quantum algorithms.

## Standards and candidate building blocks
- NIST FIPS 204: ML-DSA digital signatures; evaluate parameter sets and signature sizes for wallet and validator use.
- NIST FIPS 203: ML-KEM key establishment; use only within a fully authenticated network handshake.
- NIST FIPS 205: SLH-DSA as a conservative alternative or recovery path where size/performance permit.
- Hybrid classical/PQ signatures and handshakes may reduce migration risk, but hybrid constructions require explicit, reviewed verification semantics.
- Never confuse key encapsulation with digital signatures; ML-KEM does not authenticate a transaction by itself.

## Proposed protocol boundaries
1. Every transaction and validator vote must have a domain-separated, versioned canonical signing envelope, including chain ID, purpose, protocol version, nonce/height, and signing algorithm.
2. Algorithm registry is allowlisted and versioned by governance; unknown or deprecated algorithms fail closed.
3. During migration, explicit policy can require BOTH independently verified classical and PQ signatures; never silently fall back to classical-only.
4. Address/account identifiers must bind to registered verification keys and key-rotation authorization; avoid permanent exposure of signing keys before necessary.
5. Support key expiry, rotation, compromised-key response, and recovery without granting a privileged arbitrary balance-change capability.
6. Node transport needs authenticated encryption and replay protection in addition to PQ key establishment.
7. Preserve historical verification rules and state commitments across algorithm upgrades; test old blocks under their original protocol rules.
8. Test adversarial cases: downgrade attempts, algorithm confusion, key substitution, wrong domain, replay, corrupted large signatures, conflicting validator votes, and crash recovery.

## Practical zero-spend sequence
A. Add a policy-only crypto-agility module with fail-closed algorithm selection, no false claims of PQ security.
B. Implement standardized ML-DSA through a maintained audited library/runtime when available; verify against published test vectors and independent implementations.
C. Benchmark signature/key size, mobile wallet latency, block bandwidth, node storage and CPU on target hardware.
D. Add hybrid wallet and validator signing, authenticated hybrid networking, migration and recovery.
E. External security review and adversarial testnet before any real EC issuance.

## Non-goals
No claims of quantum entanglement, quantum internet, quantum random-number hardware, quantum mining advantage, guaranteed future-proof security, or automatic compatibility with Apple/Google secure hardware. Do not deploy real assets, collect payments or turn on issuance from this document.
