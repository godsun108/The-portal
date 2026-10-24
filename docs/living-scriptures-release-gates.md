# Living Scriptures — release gate evidence

Status: **DRAFT / NOT APPROVED FOR PUBLIC DEPLOYMENT**

## Verified automated evidence
- World English Bible archive pinned to SHA-256 `1298c07ccd62fe8ebab6d0cc94ab75a88dd95272d7fe618faeb7a8f6d632c6e0`.
- Source checks cover 81 scripture-book files, 1,402 chapters and 38,058 verse markers in the selected source archive. These are edition-specific counts, not a claim about all biblical canons.
- Every staged chapter JSON file is now structurally checked against the source manifest, including edition/book/chapter consistency and nonempty verse records.
- Chromium unit, browser and real-data offline tests have passed in prior CI runs.
- Existing PORTAL contracts have passed.
- Simulated mobile WebKit checks added; inspect latest GitHub Actions result before marking them passed.

## Outstanding human verification
- A qualified textual/editorial reviewer must inspect representative and edge-case passages: poetry, footnotes, cross-references, headings, deuterocanonical material, RTL scripts and alternate verse numberings. A source-preserving projection is **not** an editorially approved WEB critical edition.
- Accessibility review: screen-reader usage, VoiceOver on a physical iPhone, contrast, zoom to 200%, focus ordering, reduced-motion and long-book navigation.
- Physical-device Safari test, including storage eviction and offline persistence.
- Edition attribution and licensing verification (WEB text public domain; identify name/trademark and any separate media assets).
- Visual and UX acceptance review.
- Human approval before merge and public release.

## Policy
Never state the project reconstructs the single original Bible. The library should accurately expose the diversity of textual witnesses, historical traditions, and scholarly uncertainty. Never silently replace or invent scripture text. Keep canon attribution explicit.

## Deployment
Do not merge PR #297 or turn on a production link until outstanding human acceptance gates are satisfied. The LIBRARY station and staged source content are currently **development-branch only**.
