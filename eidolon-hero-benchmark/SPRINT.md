# EIDOLON Hero Realism Sprint · Working Contract

**North star:** an original, reusable virtual human suitable for close-up film, games, AR and iPhone previews. The generated turnaround image is a **visual design target only**, NOT a mesh, rig, UV map, or finished performer.

## Reality baseline (October 2026)

- VHE Stage128/164 canonical procedural actor: 12,240 vertices, 24,454 triangles, independently tested as a static GLB and on-device animated research variant.
- V5–V8 experimental variants: novel smooth-union field geometry, 17-joint skeleton, basic embedded Idle + Walk. Walking preview and iPhone recordings operate.
- V7 user walking video: oversmoothed / melty anatomy and inadequate motion. V8 experimental colored mesh still requires objective and on-device quality approval.
- No accepted photoreal body, artist-grade retopology, proper face rig, accurate hands, realistic clothing topology, foot planting, corrective morphs, or Stage166 biomechanical admission yet.
- No false claims that an image render can be converted into a valid rigged mesh automatically.

## Architecture: one authoritative foundry

Keep `godsun108/virtual-human-engine` authoritative for research contracts and candidate admission. Use `The-portal` for iPhone-first display and export. Keep all candidate assets isolated. Never overwrite canonical GLBs or claim provisional tests as definitive.

## Five sprint gates

### Gate A: silhouette + anatomical landmarks
- Neutral A / relaxed pose, consistent units Y-up, five-finger hands, proper ankle/foot shape.
- Four unbiased views: front, 3/4, side, back; same neutral lighting / camera distance.
- No overlapping clay blobs or disconnected visual bands at neck, shoulder, groin, elbow, knee.
- **Deliverable:** rigged candidate GLB, four-view contact sheet, geometry manifest.
- **Reject** if anatomical silhouette is still obviously mannequin-like.

### Gate B: deformation under test poses
- Clavicles, twist support or corrections, elbow and knee flexion, hip flexion, wrist motion, head rotation.
- Quantitative mesh integrity: finite vertices/normals, valid bone weights, no inverted triangles or collapsed polygons, bound-check joint influence regions.
- Test isolated shoulder elevation, arm forward bend, hip flex, knee bend, wrist twist before gait.
- **Reject** if seams tear, tube-collapse, or body mass melts.

### Gate C: expressive face
- Facial topology with independent eyelids, eyeballs, lips, jaw, brows, nose, and ear forms.
- Eye aim, blinks, speech visemes; consistent face identity in all angles.
- **Reject** decorative floating face parts as facial rig substitutes.

### Gate D: material / lighting realism
- UV unwrap, licensed skin normal/roughness/base-color maps or original procedural equivalents.
- Eyes with cornea, iris/sclera; discrete garment mesh with seams and thickness; defined hair surface.
- Neutral material/lighting audit vs cinematic lighting; avoid using beauty-lighting to hide defects.
- **Reject** texture-only improvements that conceal bad geometry.

### Gate E: performance and interoperability
- Contact-aware walk, idle breathing, head turn, smile; assess feet at ground-contact frames.
- Import/export GLB roundtrip including skin and motion; actual iPhone Brave and Safari tests.
- 4-second film shot (turn/look/step/smile) with no catastrophic deformation; original MP4 and candidate GLB stored.
- Stage166 audit only when all its mandatory objective tests actually pass.

## Automated QA truthfulness
The `eidolon-hero-benchmark/` viewer exports actual 3D screenshot evidence and *manual* checkboxes. It does not certify realism automatically. Each new version must be compared at the same camera angles and under the same lighting. Preserve earlier versions for regression tests.

## Next implementation priority
**Replace implicit capsule-union anatomy with a human-authored or parameterized topology-conscious base mesh.** Use existing open-source tools where licensing and reproducibility are verified. The largest bottleneck is not triangle count; it is anatomical structure, UV layout, rigging and realistic deformation. Only increase resolution after these pass.

## Phone workflow
Open `https://godsun108.github.io/The-portal/eidolon-hero-benchmark/index.html`, start viewer, load V8 (or prior), capture 4-view proof, record walking video, save/attach both to the conversation. Use exported QA JSON to maintain test history.
