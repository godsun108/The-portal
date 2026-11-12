# Project 137 — Research Engine

A reproducible evidence workflow supporting the Portal's **The 137 Exhibit**. This directory is the research record; the exhibit is the public interpretation layer.

## Operating principles

1. Separate **established science**, **active research**, and **open exploration**.
2. Every factual claim has a stable ID, evidence grade, source links, review date, and an explicit uncertainty note.
3. Prefer primary literature, standards bodies, official observatories/laboratories, and authoritative data releases.
4. A source is not proof by itself. Record methods, sample/context, limitations, replication status, and conflicts.
5. Never force-fit 137, prime numbers, sacred geometry, or numerology to physical data.
6. Do not describe a hypothesis as a discovery, a simulation as an experiment, or a correlation as a causal mechanism.
7. Proposed Project Alpha experiments remain proposals until performed and independently checked.
8. Research changes do not automatically change the public exhibit. Prepare a proposed change and require human review.

## Files

- `claims.json` — claim ledger; stable IDs and evidence classifications.
- `sources.json` — curated source registry with source type and relevance.
- `experiments.json` — proposed/research protocols and falsifiable questions.
- `schemas/` — JSON Schemas for validating records.
- `templates/` — templates for new claims, sources, and research reviews.
- `reviews/` — dated research digests and change proposals.
- `scripts/validate.py` — standard-library validation; no third-party runtime dependency.

## Evidence grades

| Grade | Meaning |
|---|---|
| A | Established: replicated measurement, strong consensus, or authoritative reference data |
| B | Strong evidence: multiple independent results, with meaningful remaining limitations |
| C | Active research: plausible and investigated, but not settled |
| D | Speculative: mathematically or conceptually proposed; not empirically established |
| X | Unsupported / contradicted / withdrawn: retained only to document why a claim is rejected or excluded |

Grades are not a universal ranking of scientific quality. Each record must explain why its grade applies.

## Review workflow

1. Add a source record with publication date, DOI/URL, source type, and access date.
2. Add or update a claim with a concise statement, scope, grade, limitations, and supporting/challenging sources.
3. Record whether the result is observational, experimental, theoretical, computational, or interpretive.
4. Update an experiment only when its prediction, method, controls, and falsification criteria are explicit.
5. Run `python research/137/scripts/validate.py`.
6. Submit a dated review under `research/137/reviews/` with proposed exhibit edits.
7. Reviewers check citations, wording, reproducibility, and whether the change alters the exhibit's meaning.
8. Only after approval should a separate PR update `137/index.html`.

## Scope

The ledger begins with foundational claims from the 19-chapter exhibit. It is deliberately conservative: it records what is known, what remains unresolved, and what would count as a meaningful update. It does not claim to have discovered a new derivation of the fine-structure constant.
