# Living Scriptures — editorial and source contract (v1)
Status: draft; not published. This document governs the independent `living-scriptures.html` preview.

## Purpose
Present historical biblical traditions and associated ancient literature without claiming to recover a single lost "true Bible." Keep manuscript evidence, translations, scholarly inferences, and theological claims distinct.

## Source policy
- **World English Bible (WEB)**: eBible's official public-domain English translation, https://ebible.org/eng-web/ . Its full ecumenical edition includes deuterocanonical material. Preserve text verbatim and identify the edition. "World English Bible" is a trademark used to identify faithful copies; modified text must not retain that name. Source downloads: https://ebible.org/find/show.php?id=eng-web .
- **Sefaria**: https://developers.sefaria.org/reference/getting-started . Provides Hebrew texts and translations through an API; **each text version has its own reuse license**. Do not import any edition before recording its license and attribution. https://developers.sefaria.org/docs/usage-of-our-name-and-logo .
- **Manuscript projects**: link to official institutional digitizations; do not assume manuscript photography is public domain.
- **Enoch, Jubilees, Thomas, Didache**: catalog metadata and links only until edition-specific reuse rights and provenance are verified.

## Required per-edition fields
`work_id`, `edition_id`, `title`, `language`, `translator/editor`, `source_url`, `license`, `attribution`, `source_version_date`, `content_sha256`, `imported_at`, `verified_by`.
Keep editorial annotations in separate records. Do not merge variants into a synthetic "original" without explicit reconstruction labeling.

## Canon matrix
Canon inclusion is tradition-specific, not a universal binary. Model the Jewish Tanakh, Protestant, Catholic, Eastern Orthodox, and Ethiopian Orthodox collections separately. Verify book-by-book membership with primary sources and qualified reviewers before displaying a complete canon matrix.

## Release gates
1. Accessible mobile navigation and search; no regressions to the PORTAL homepage.
2. Every displayed full text is either public domain or licensed for the specific reuse.
3. Verified book/chapter/verse completeness and stable source hash for imports.
4. Comparison view labels both exact editions; missing text is explicitly missing.
5. Independent historical and religious-community review before any claim of exhaustive coverage.
6. Automated tests and manual iPhone checks pass before merge.

## First release boundaries
The initial catalog is a research index. It is **not yet a complete reader**, a critical edition, or a verified reconstructed canon. No private data, AI-generated scripture, or unsupported authenticity scores.
