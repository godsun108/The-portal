# EIDOLON motion ingestion

The motion catalog is a **reviewed asset registry**, not an automatic third-party downloader. No assets are approved by default.

## Add an approved motion

1. Obtain a GLB with actual animation channels and explicit redistribution permission. Keep the original source URL and license evidence.
2. Confirm the animation targets the EIDOLON MakeHuman 163-bone rig. A matching bone name alone does **not** prove correct bind pose or visual quality.
3. Place the file under `eidolon-native-motion/assets/motions/`.
4. Compute `sha256sum eidolon-native-motion/assets/motions/your-motion.glb`.
5. Add an entry to `eidolon-native-motion/motion-catalog.json`:
   ```json
   {
     "id": "example-motion",
     "title": "Example Motion",
     "license": "CC0-1.0",
     "source_url": "https://example.org/original-motion",
     "license_evidence": "URL or documented source proving redistribution permission",
     "rig": "makehuman-native-163",
     "path": "assets/motions/your-motion.glb",
     "sha256": "64 lowercase hexadecimal characters",
     "bone_names": ["NameOfAnimatedBone"]
   }
   ```
6. Run `node scripts/check-eidolon-motion-catalog.cjs` and `node scripts/check-eidolon.cjs`.
7. Open the studio and use **Load approved catalog** to inspect playback.

## Quality gates

CI verifies license metadata, file integrity, GLB JSON structure, animation presence, named rotation channels, and declared bone targets. Browser smoke checks the existing model and action controls. **Neither gate currently proves realistic motion or safe retargeting.** Human visual review remains required before declaring production-ready animation.

## Next automation milestone

Introduce an asset review queue, test video generation, objective motion metrics, and approval controls. Do not automatically ingest unverified third-party assets or assume a permissive license from a download URL.
