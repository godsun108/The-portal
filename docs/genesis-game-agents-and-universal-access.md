# Genesis Game Agents and Safe Autonomy

## Purpose

Give every Portal/EarthChain game a repeatable improvement loop: observe real playtests, identify friction or defects, propose a small change, validate it, and safely release or roll it back. Agents should improve games without inventing telemetry or treating simulated play as real user evidence.

## Agent roles

- **Observer**: reads opt-in, minimized playtest events and QA results; reports crashes, abandoned sessions, input failures, difficulty spikes and performance regressions.
- **Playtester**: runs deterministic scripted scenarios and device/browser test matrices. Synthetic results are labelled synthetic.
- **Designer**: proposes mechanics, tutorial, accessibility and balance changes with evidence and expected impact.
- **Engineer**: creates a scoped branch/patch and adds or updates tests.
- **Reviewer**: independently checks the diff, security boundaries, test evidence, accessibility and policy compliance. The authoring agent cannot approve its own patch.
- **Release steward**: checks policy gates, canary results and rollback readiness.

## Improvement loop

1. Observe only permitted data. Prefer aggregate counters and event codes; do not collect chat content, precise location, device identifiers or personal data by default.
2. Produce an evidence-backed issue with reproduction steps and confidence.
3. Propose one bounded change on an isolated branch.
4. Run unit, integration, accessibility, performance and regression checks relevant to the change.
5. Obtain an independent agent review and record its rationale.
6. For eligible low-risk changes, policy may authorize automatic merge to a protected staging branch and a limited canary.
7. Monitor the canary against explicit guardrails. Revert automatically when a guardrail trips.
8. Keep an auditable record of evidence, patch, tests, approvals, rollout and rollback.

## Autonomy tiers

### Tier 0 — observe
Read approved telemetry, run tests, summarize issues. No writes.

### Tier 1 — sandbox autonomy
Agents may edit isolated branches, create test fixtures, tune non-economic game balance in a sandbox, improve documentation, and run local/CI tests. No human approval is needed for each edit; an independent reviewer agent and passing automated gates are required before promotion.

### Tier 2 — controlled staging
Agents may merge eligible changes to a protected staging branch and run a canary only when all required checks pass, the change is reversible, and the policy explicitly allows that class of change. Independent review must be by a separate agent identity.

### Tier 3 — approval required
Human approval remains required for production-wide releases, identity/authentication or permission changes, wallet/payment/commerce/ownership logic, EarthCoin or valuable rewards, cryptographic/key changes, user-data collection or retention changes, destructive migrations, external communications, moderation sanctions, and changes that expand agent permissions.

## Non-negotiable controls

- Least-privilege credentials, scoped per repository and environment; no secrets in browser code or prompts.
- No self-approval, no hidden policy changes, and no agent may grant itself new permissions.
- Protected branches, signed/auditable actions, immutable run logs, reproducible builds where practical.
- Tests must distinguish simulated agents from real players.
- No synthetic telemetry presented as real player evidence.
- Rollback must be tested before autonomous canary release.
- Game clients are untrusted. Client-reported wins, scores, ownership and purchases never authorize rankings, inventory or currency.
- Any agent action outside its tier fails closed and requests the required approval.

## First game pilot: Starfall

Start with read-only observation and scripted playtests. Track only aggregate session start/end, sector reached, death reason code, seed count, frame-time buckets, input method and error codes. Keep local device records local unless the user opts into sharing. Build deterministic scenarios for touch, keyboard, pause/resume, sector transitions and boss completion.

Initial autonomous changes can include test improvements, copy/tutorial wording, non-economic cosmetic presentation, and reversible difficulty parameters in a sandbox. Competitive match rules, scoring authority, signed collectibles and EarthChain rewards remain outside autonomous authority until server-authoritative verification exists.

## Universal Genesis access

`genesis-dock.js` is the first reusable floating entry point. It opens the existing Portal Intelligence conversation in a side panel and includes the current page path/title as URL context. It is currently included in Starfall and EarthChain Genesis as a pilot.

The dock is a UI entry point, not a new inference service. The existing `intelligence/config.json` currently has a null endpoint and dormant mode, so a working model connection is not implied. The next integration must establish a secure, authenticated shared Genesis session, pass only user-approved page context, and preserve conversation continuity across modules. The dock should be rolled out through the shared Portal shell/navigation or a common layout include rather than manually copied forever.

## Next implementation milestones

1. Add the dock to the shared Portal station shell and verify it on mobile layouts.
2. Connect it to a verified Genesis session endpoint; do not expose model credentials to the browser.
3. Define a typed page-context handoff and user-visible context controls.
4. Build Starfall observer events and deterministic playtest scenarios.
5. Add isolated agent patch proposals, independent reviewer approvals, policy tiers and rollback records.
6. Run the first sandbox-only improvement cycle; do not enable autonomous production deployment yet.

## Conversation continuity and page-context consent (pilot)

The Intelligence surface now persists the last 40 user/assistant text messages in same-origin browser localStorage under `portal-genesis-conversation.v1`, so the floating dock can reopen the same conversation as the user moves between supported pages. A **Clear local chat** control removes that browser copy after confirmation; it does not delete any server-side history. This is local browser storage, not encrypted storage or cross-device sync.

The dock passes the current page pathname and title as URL parameters to the Intelligence iframe. Those values are not included in the model request unless the user explicitly checks **Share this page with Genesis for this conversation**. The context is limited to pathname and title; do not pass page contents, form values, credentials, wallet data or private messages by default. The consent checkbox is per page load and starts unchecked.

The model endpoint remains dormant in `intelligence/config.json`. Persistence and context consent are implemented UI behavior, not proof that a live model, remote memory or authenticated Genesis session exists.
