# Native EarthChain validator discovery and evidence status

Reviewed 2026-10-25 on the PORTAL development branch.

## Reusable and verified in source
- `earthchain-test/protocol.mjs`: Ed25519-signed ECTEST transaction packets, deterministic journal verification, replay checks.
- `earthchain-test/mutual-ledger.mjs`: two-party acknowledgements; explicitly **not** public blockchain consensus.
- `earthchain-test/wallet-crypto.mjs`: locally encrypted test wallet with signing support.
- `portal-exchange/ec-native-receipt-contract.mjs`: native EC receipt schema, requires external finality verifier.
- `portal-exchange/ec-native-finality-adapter.mjs`: explicit fail-closed integration boundary.

## Not yet established
- Production EarthChain node or validator implementation and its repository/path.
- Trusted production genesis hash, chain ID, validator public keys and quorum rules.
- Independent canonical block proof / transaction inclusion verifier.
- Production native EC issuance policy and auditable distribution.
- Approved fiat payment provider and legal authorization for real USD/EC exchange.

A repository-wide search of the connected PORTAL code did not identify a production validator implementation. Search results for similarly named unrelated GitHub projects are not evidence of our own network. The validator may live in another EarthChain repository not yet identified.

## Next concrete integration
Locate the actual native node/validator repository or deployment manifest. Read its genesis, block header, validator quorum, signature format and transaction proof schemas. Then implement a verifier against those real formats, with adversarial tests for fake signatures, insufficient quorum, forged inclusion, wrong network, and reorgs. Do not use an arbitrary confirmation count or a self-declared receipt as finality.

No real payments, coin issuance, or production transfers are authorized by this document.
