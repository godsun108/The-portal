# PORTAL Rigveda — independent source-review collection

**State:** Draft, standalone research navigator on `feature/rigveda-library-v1`. This branch is based on `main`, **not** on the unmerged Living Scriptures Bible reader PR #297. No merge, production deployment, text import, recordings, payments, or token operations.

## Organization and responsible presentation
- Ṛgveda: `rigveda/index.html`, ten maṇḍalas.
- The source registry models the common Śākala recension (10 maṇḍalas, 1,028 sūktas, 10,552 mantras) according to the Government of India's Vedic Heritage Portal. Variation in counting and ancillary material requires explicit recension and edition labels.
- Reference IDs: `RV mandala.hymn`, for example `RV 3.16`; future mantra IDs `RV 3.16.7` should map to inspected textual witnesses, not inferred offsets.
- Future views: Sanskrit with appropriate accents / script metadata, IAST transliteration with reversible conversion, parallel attributed English edition, metre and source commentary, recitation with recordings only by permission, side-by-side witness comparison.
- The current visual text panes intentionally say **not imported**. We do not generate synthetic Sanskrit, translation, audio, or alignments.
- No claims that Christian biblical canons and Vedic traditions share a single canon, textual origin, or interpretation.

## Source and reuse review
| Candidate | Research use | Import decision |
| --- | --- | --- |
| Vedic Heritage Portal (https://vedicheritage.gov.in/Samhitas/) | Counts, terminology, mandala structure, practitioner and cultural context | Links only; permission for redistribution of any content not established |
| GRETIL (https://gretil.sub.uni-goettingen.de/gret_utfbk.htm) | Sanskrit comparison and edition metadata | **Blocked.** Its archives explicitly restrict files to scholarly reference and exclude commercial uses. A permissive source or explicit rights clearance is required. |
| Ralph T. H. Griffith, 1896 translation, indexed by Sacred Texts (https://sacred-texts.com/hin/rigveda/) | Public-domain *historical translation* candidate | **Blocked for copy.** Verify exact printed source, modern digitization provenance, geographical copyright status, correction/editorial overlays and ability to redistribute machine-readable transcription |
| UNESCO Vedic chanting (https://ich.unesco.org/en/RL/tradition-of-vedic-chanting-00062) | Living recitation tradition and the importance of tonal accents | External context only. Recording/performer rights not obtained |

## Safe next import milestone
1. Locate a legally reusable, independently verifiable Vedic Sanskrit digital transcription. Record recension, edition, script, accent conventions, text hash, terms and citations.
2. Inspect one public-domain translation source and its OCR/editorial changes; do not silently treat 1896 translation as equivalent to a modern scholarly translation.
3. Build schema for mandala / hymn / verse with separate source hashes, accents, translation IDs and optional audio performance metadata.
4. Test reversible rendering, authentic references, no verse omissions, iPhone screen-reading, offline availability and browser memory limits.
5. Obtain editorial and cultural review; publish only after rights and accessibility acceptance.

**No content is imported by this draft.** The public PORTAL and Bible release branch remain unchanged.
