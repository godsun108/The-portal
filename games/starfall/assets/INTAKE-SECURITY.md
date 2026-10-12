# Authenticated Asset Intake — design gate

Status: **contract and tests only**. No intake endpoint is deployed, and the public Foundry does not upload files.

Recommended architecture: use a GitHub App installation token **server-side** on an existing authenticated service, scoped to the single repository with minimal Contents and Pull Requests permissions. Require a logged-in operator, CSRF protection, rate limits, request-size caps, and an explicit submit action. Do not place the app private key, GitHub token, or long-lived API secret in static GitHub Pages JavaScript.

For every submission, independently hash the received bytes (SHA-256) and compare with the submitted digest, parse and validate the manifest, fully decode PNG or safely sanitize SVG in a sandboxed process, and store immutable staged files on a unique proposal branch. Never accept arbitrary paths or branch names. Open a PR for review; never auto-merge. Log actor, hash, size, and PR URL without logging secrets. Avoid accepting uploaded SVG unless a strict sanitizer is implemented.

The `intake-contract.mjs` module provides only the metadata/path guardrail, not authentication, full image validation, content safety, authorization, file storage, or PR creation. The existing GitHub Actions staged-release workflow remains the only automated proposal mechanism. Do not enable a public upload button until those missing controls are built and tested.

Before deployment, choose the existing service that will host the endpoint, confirm its authenticated operator session and GitHub App permissions, and obtain explicit approval for any production service changes.
