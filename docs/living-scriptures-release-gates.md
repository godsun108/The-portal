# Living Scriptures — release gate evidence

Status: **PUBLIC PREVIEW ELIGIBLE AFTER CI; FULL EDITORIAL RELEASE NOT APPROVED**

## Verified automated evidence
- World English Bible archive pinned to SHA-256 `107c0c220a67b9e43baa18e849e19076d41b8e169a0c71d4b9fd2d77db94c152`.
- Source checks cover 81 scripture-book files, 1,402 chapters and 38,058 verse markers in the selected source archive. These are edition-specific counts, not a claim about all biblical canons.
- Every staged chapter JSON file is now structurally checked against the source manifest, including edition/book/chapter consistency and nonempty verse records.
- Chromium unit, browser and real-data offline tests passed in prior CI runs; the latest rerun is checking the refreshed corpus and the expanded 1 Enoch offline test.
- Existing PORTAL contracts have passed.
- Simulated mobile WebKit browsing, real-data chapter loading, local chapter offline reading, book navigation and resume have passed in CI. Full offline reopen is tested in Chromium; Playwright's Linux WebKit reload crashes internally when the context is forced offline, so that specific automation case is skipped in WebKit and must be verified on physical iOS Safari. Linux WebKit full offline page reload can return an internal navigation error, so physical iOS offline reopening is still unverified.
- Latest verified complete pass after keyboard skip link, accessible verse labels, narrow-screen text-scaling and source-note disclosure: https://github.com/godsun108/The-portal/actions/runs/40151585590 (official-web-source-audit, browser-tests, stage-chapter-corpus all succeeded).

## Fixed scope for completion
- Ship the pinned 81-book WEB source edition, without adding speculative books or claiming that the edition represents every biblical canon.
- No new translation or unreviewed wording changes. Retain original USFM alongside readable projection.
- Finish only the physical Safari/VoiceOver/offline reopening and editorial acceptance gates below before seeking release approval.

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
- Preview-only deployment is permitted after the latest automated checks pass; the home page, Bible reader, 1 Enoch reader and research catalog must carry a visible status notice.
- Full public-release approval remains pending physical iPhone Safari/VoiceOver/offline checks, editorial review and final UX acceptance.
A clearly labeled **public preview** may be merged after automated checks pass, provided every reader surface displays the preview/editorial-status notice and the About the texts section remains intact. This is not final editorial or accessibility certification. Do not describe the corpus as a critically edited or universally canonical edition. Full release approval remains blocked on the human gates above.

## Current source refresh (2026-11-15)

- Latest upstream refresh: `107c0c220a67b9e43baa18e849e19076d41b8e169a0c71d4b9fd2d77db94c152`; 64 of 81 book hashes changed and were regenerated on the integration feature branch. The refreshed corpus still validates at 81 books / 1,402 chapters / 38,058 verse markers.
- Latest source-render audit: 38,058 verse markers, 0 unresolved markup markers, 0 blank projected verses, 1,850 footnotes; status remains `projection-markup-clean-not-editorially-certified`.
- eBible reissued the source archive. The newly downloaded archive SHA-256 is `107c0c220a67b9e43baa18e849e19076d41b8e169a0c71d4b9fd2d77db94c152`.
- The current archive still audits to 81 books, 1,402 chapters and 38,058 verse markers, but **64 of 81 book-level source hashes differ** from the previously staged corpus.
- The refreshed chapter corpus has been regenerated on this feature branch from the exact archive above. Its source manifest records the new archive hash and per-book hashes; production remains untouched.
- The source refresh is structurally validated but not editorially certified. Editorial comparison remains a release gate; do not imply scholarly certification.
