# Living Scriptures — release gate evidence

Status: **DRAFT / NOT APPROVED FOR PUBLIC DEPLOYMENT**

## Verified automated evidence
- World English Bible archive pinned to SHA-256 `1298c07ccd62fe8ebab6d0cc94ab75a88dd95272d7fe618faeb7a8f6d632c6e0`.
- Source checks cover 81 scripture-book files, 1,402 chapters and 38,058 verse markers in the selected source archive. These are edition-specific counts, not a claim about all biblical canons.
- Every staged chapter JSON file is now structurally checked against the source manifest, including edition/book/chapter consistency and nonempty verse records.
- Chromium unit, browser and real-data offline tests have passed in prior CI runs.
- Existing PORTAL contracts have passed.
- Simulated mobile WebKit browsing, real-data chapter loading, local chapter offline reading, book navigation and resume have passed in CI. Linux WebKit full offline page reload can return an internal navigation error, so physical iOS offline reopening is still unverified.
- Latest verified complete pass before editorial render additions: https://github.com/godsun108/The-portal/actions/runs/40093832063 .

## Outstanding human verification
- A qualified textual/editorial reviewer must inspect representative and edge-case passages: poetry, footnotes, cross-references, headings, deuterocanonical material, RTL scripts and alternate verse numberings. A source-preserving projection is **not** an editorially approved WEB critical edition.
- Accessibility review: screen-reader usage, VoiceOver on a physical iPhone, contrast, zoom to 200%, focus ordering, reduced-motion and long-book navigation.
- Physical-device Safari test, including storage eviction and offline persistence.
- Attribution/legal terms: official eBible states the WEB translation text is public domain, but the 'World English Bible' name is a trademark; display projection must be clearly distinguished from untouched source and reviewers must inspect attribution on all public surfaces. Independently verify non-text media licenses before inclusion.
- Physical-iPhone offline HTML sample: user screenshots on 24 Oct 2026 visibly confirmed Genesis 1 and both Psalm 23 and John 3 opening/closing via native HTML details; warm ivory text, gold verse numbering, and source notes visible. This is **limited visual and interaction evidence for a separate static sample**, not a full-app Safari or VoiceOver sign-off.
- Visual and UX acceptance review for the complete live reader.
- Human approval before merge and public release.

## Policy
Never state the project reconstructs the single original Bible. The library should accurately expose the diversity of textual witnesses, historical traditions, and scholarly uncertainty. Never silently replace or invent scripture text. Keep canon attribution explicit.

## Reviewer decision
- Automated structural validation: PASS.
- Offline chapter reading under Chromium / simulated WebKit: PASS.
- Accessibility smoke tests: PASS, not a VoiceOver certification.
- Physical iPhone static sample chapter expansion and visible verse text: PASS (user screenshots; limited scope).
- Full reader on physical iPhone Safari + VoiceOver + full offline reopening: PENDING.
- Editorial display comparison: PENDING.
- Public release approval: PENDING.

## Deployment
Do not merge PR #297 or turn on a production link until outstanding human acceptance gates are satisfied. The LIBRARY station and staged source content are currently **development-branch only**.
