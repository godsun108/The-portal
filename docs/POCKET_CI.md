# Pocket CI: on-device browser tests and evidence

Pocket CI is a static browser test lab at `pocket-ci.html`, pending merge/deployment in PR #195.

## Capabilities

- Real browser self-tests for the report inspector.
- Same-origin fetch and markup smoke checks for four fixed PORTAL files.
- Import of a local `portfolio-verification.json` for **untrusted** structural inspection.
- Export of bounded `pocket-ci-browser-evidence/v1` JSON reports after running a browser test.

**A browser JSON download is not authenticated CI evidence.** The exported `evidence_type` is always `untrusted-browser-local`; no HMAC credentials, tokens, local filesystem paths, or stdout/stderr are serialized. A downstream system must not treat it as the signed receipts from Command Center's private verifier.

## iPhone smoke test

After the PR is reviewed, merged, and Pages has deployed the updated files:

1. Open `https://godsun108.github.io/The-portal/pocket-ci.html` in Safari.
2. Run the ten browser engine checks. Inspect each PASS/FAIL rather than merely the summary.
3. Run the PORTAL static checks on the same website. Missing resources must fail.
4. Choose **Export engine result** and **Export PORTAL result**. Save the resulting JSON files locally in Files.
5. Confirm their `evidence_type` remains `untrusted-browser-local`, including on successful results.
6. Optionally inspect a private runner-generated JSON locally. It will be parsed only in browser memory, but still handle the file as potentially sensitive.

The live URL is **not guaranteed accessible before merge and Pages deployment**.

## Node tests

In an existing repository checkout with Node 20+:

```sh
node --test tests/pocket-ci.test.mjs tests/pocket-ci-portal.test.mjs tests/pocket-ci-evidence.test.mjs
```

These tests require neither `npm install` nor a GitHub-hosted runner. They cannot test actual iOS Safari behavior, streaming availability, backend deployments, signed identity, or production uptime. No workflow or secrets are modified.

## Trust and operational boundaries

Do not claim a device is an always-on runner: mobile browsers can suspend or close tabs. Do not execute arbitrary submitted scripts, expose signing keys on a public page, or allow untrusted exports to satisfy branch protections. A future private server could accept browser evidence **only as untrusted telemetry**, with appropriate authentication, authorization, rate limits, replay protection, and a separate source label.

This page uses a download API exposed through a direct user click and makes no network upload. On iOS, check the actual download behavior before promoting the feature.
