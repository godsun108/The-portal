# EIDOLON canonical high-detail bridge

The **recovered procedural Stage128/164 actor** is rebuilt on GitHub Actions from the documented field and grid in `godsun108/virtual-human-engine`.

## Published assets

| Asset | Vertices | Triangles | Rig | Animation | Status |
|---|---:|---:|---|---|---|
| `assets/eidolon-human-v1-canonical.glb` | 12,240 | 24,454 | none | none | generated and GLB structure checked; phone import pending |
| `assets/eidolon-human-v1-rigged-experimental.glb` | 12,240 | 24,454 | 17 joints, heuristic weights | experimental Idle + Walk | generated and GLB structure checked; phone rig/animation check pending |

Neither asset proves realism, Luna likeness, natural locomotion, or Stage166 acceptance.

## Exact source contracts

- VHE `src/vhe/eidolon_stage128.py` — signed distance field.
- VHE `src/vhe/eidolon_stage164.py` — grid + extraction contract.
- VHE `src/vhe/eidolon_stage165.py` — separate registered research identity.
- VHE `src/vhe/eidolon_stage166.py` — quantitative locomotion admission gate.

Stage162's old 13,832 / 27,660 topology is **not** the canonical admitted actor. The current source is the Stage164 12,240 / 24,454 recipe. Asset SHA-256 digests appear in the two manifests, and are not claimed to equal the Stage165 identity fingerprint.

## Rebuild

Run in the repository root on Python 3.11:

```sh
python -m pip install numpy==2.3.5 scikit-image==0.26.0
python scripts/build_eidolon_canonical.py
python scripts/build_eidolon_rigged.py
```

The GitHub workflow `EIDOLON Canonical Mesh Build` runs both scripts, checks expected geometry counts and GLB header/chunks, uploads artifacts and commits published assets to `eidolon-canonical/assets/`. `eidolon-canonical/index.html` lazily loads the 3D engine, imports one of the assets with Three.js GLTFLoader, then checks actual vertex/index and skeleton/clip counts in browser. The iPhone visual QA is **separate** from build-system proof.

## Remaining milestones

1. Independently verify static and rigged GLB import on an iPhone and inspect joint deformations.
2. Replace heuristic weights with topology-aware smooth weights plus correct hip, shoulder and wrist deformation.
3. Prove an actual Stage166 same-run motion audit with all 97 frames and thresholds.
4. Add face/hair/cloth/materials, verified actor identity/language support, and a 4-second filmed performance shot. Never label this prototype photorealistic.
