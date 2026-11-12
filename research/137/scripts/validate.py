#!/usr/bin/env python3
"""Validate Project 137 research records using only Python's standard library."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_GRADES = {"A", "B", "C", "D", "X"}
REQUIRED_CLAIM = {"id", "statement", "grade", "domain", "claim_type", "status", "limitations", "sources", "last_reviewed"}
REQUIRED_SOURCE = {"id", "title", "publisher", "source_type", "url", "accessed"}
ERRORS = []

def load(name):
    path = ROOT / name
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        ERRORS.append(f"{name}: cannot parse JSON: {exc}")
        return {}

def unique_records(label, records, required):
    seen = set()
    if not isinstance(records, list):
        ERRORS.append(f"{label}: expected an array")
        return
    for i, item in enumerate(records):
        if not isinstance(item, dict):
            ERRORS.append(f"{label}[{i}]: expected an object")
            continue
        missing = sorted(required - item.keys())
        if missing:
            ERRORS.append(f"{label}[{i}]: missing {', '.join(missing)}")
        ident = item.get("id")
        if not isinstance(ident, str) or not ident.strip():
            ERRORS.append(f"{label}[{i}]: id must be a non-empty string")
        elif ident in seen:
            ERRORS.append(f"{label}: duplicate id {ident}")
        else:
            seen.add(ident)
    return seen

claims_doc = load("claims.json")
sources_doc = load("sources.json")
experiments_doc = load("experiments.json")
claim_ids = unique_records("claims", claims_doc.get("claims", []), REQUIRED_CLAIM) or set()
source_ids = unique_records("sources", sources_doc.get("sources", []), REQUIRED_SOURCE) or set()
unique_records("experiments", experiments_doc.get("experiments", []), {"id", "title", "status", "question", "method", "controls", "falsification_or_failure", "outputs"})

for i, claim in enumerate(claims_doc.get("claims", [])):
    if claim.get("grade") not in ALLOWED_GRADES:
        ERRORS.append(f"claims[{i}] ({claim.get('id')}): invalid evidence grade")
    if not isinstance(claim.get("sources"), list) or not claim.get("sources"):
        ERRORS.append(f"claims[{i}] ({claim.get('id')}): at least one source is required")
    else:
        for source_id in claim["sources"]:
            if source_id not in source_ids:
                ERRORS.append(f"claims[{i}] ({claim.get('id')}): unknown source {source_id}")
    if not isinstance(claim.get("limitations"), str) or not claim["limitations"].strip():
        ERRORS.append(f"claims[{i}] ({claim.get('id')}): limitations must be explicit")

if ERRORS:
    print("Project 137 validation FAILED")
    for error in ERRORS:
        print(" -", error)
    raise SystemExit(1)

print(f"Project 137 validation passed: {len(claim_ids)} claims, {len(source_ids)} sources, {len(experiments_doc.get('experiments', []))} experiments.")
