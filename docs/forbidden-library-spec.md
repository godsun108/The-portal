# PORTAL — Forbidden Library: evidence-first collection specification

Status: research catalog proposal, **not** a claim that any work is historically suppressed. No texts imported or published by this document.

## Mission
Provide access to historically restricted, challenged, excluded, lost, or disputed writings, with source transparency and legal reuse. This is a separate collection from the Living Scriptures Bible editions. Canonical status and censorship status are different fields.

## Required record schema
- id, title, alternative_titles, language, approximate_date, author_attribution, genre
- classification: canon_dispute | documented_ban | documented_challenge | lost_or_rediscovered | esoteric | historical_context
- canonical_traditions (where applicable), **not** a single universal canon flag
- restriction_claim: institution, jurisdiction, dates, action, primary_source_url, scholarly_source_url, confidence
- manuscript_witnesses, source_edition, translation, translator, text_provenance, source_url
- reuse_status: verified_public_domain | permission_granted | link_only | unresolved
- editorial_notes, last_verified_date

## First research queue (links first; text rights and evidence review before importing)
1. 1 Enoch — Ethiopian Orthodox biblical tradition; do not label universally banned.
2. Jubilees — Ethiopian Orthodox biblical tradition; disputed canon elsewhere.
3. Gospel of Thomas — noncanonical early Christian sayings text; verify manuscript/translation rights.
4. Gospel of Mary — fragmentary early Christian text; avoid invented missing passages.
5. Gospel of Judas — manuscript and translation rights review required.
6. Didache — early Christian community instruction, not necessarily a banned work.
7. Galileo, *Dialogue Concerning the Two Chief World Systems* — document historical Catholic prohibition and dates with primary sources.
8. James Joyce, *Ulysses* — document specific historical obscenity restrictions, not blanket worldwide ban.

## Publication gates
- Never claim a work was banned without a documented restriction tied to an institution, jurisdiction, and period.
- Never claim a noncanonical text was deliberately removed from an original Bible without evidence.
- Do not reproduce copyrighted translations or scans without permission.
- Label uncertain dating, authorship, manuscript gaps, and disputed interpretations.
- Clearly separate religious texts, censorship history, and esoteric literature.
- The initial release can provide catalog metadata and verified external links without copying texts.
- Do not expand the Bible canon or alter the WEB source corpus as part of this library.

## Build sequence
1. Finish and validate Living Scriptures reader on a physical iPhone.
2. Build a separate, searchable PORTAL catalog from reviewed structured metadata.
3. Add verified links and citation-rich restriction records.
4. Import only rights-cleared source texts and translations.
5. Add cross-links to Living Scriptures with tradition-specific labels.
