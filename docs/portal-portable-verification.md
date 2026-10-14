# Portal + EarthID — portable CI fallback

This repository now exposes `verification/portal-core.json`, a dependency-free test manifest for **Turbo Verify**. It checks permissions, two-account isolation, EarthID HTTPS origin validation, and the iPhone device lab. It requires an existing Node.js 22+ execution environment but **does not require GitHub-hosted Actions**.

The runner implementation remains owned by `godsun108/Sovereign-Core`, at `scripts/turbo-verify.mjs` on the active staging PR. To execute against **The-portal**, place an independently checked-out copy of each repository in an approved environment and run:

```sh
cd /path/to/The-portal
node /path/to/Sovereign-Core/scripts/turbo-verify.mjs verification/portal-core.json
```

This is an **integration manifest, not a distributed service**, background runner, browser executable, or GitHub check. It does not install Node on an iPhone, bypass billing or branch protection, or start Railway. The runner should be pinned to a reviewed commit before being used for release decisions.

A pass from this manifest proves only its five named checks, not all Portal, EarthID, or WebAuthn end-to-end paths. The cryptographic Genesis Core suite requires installing pinned packages in an approved isolated build environment and has separate tests. Do not claim production readiness or deploy from these results alone.

Roadmap: deterministic source revision attestation, result signing, permissions for remote execution, cache validation, change-aware selective verification and optional dispatch to **preapproved** compute. No implicit charges or new infrastructure.
