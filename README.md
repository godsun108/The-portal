# THE PORTAL

> Welcome to the other internet. Pick a door.

A mobile-first anti-Linktree and experimental world/interface layer.

## Rule

**No boring pages. Every link earns the click.**

## Ecosystem boundary

THE PORTAL is the strange public experience layer. It should reuse canonical Turbo ecosystem engines instead of quietly reimplementing them.

| Portal surface | Canonical owner | Boundary |
| --- | --- | --- |
| EARTH NOW | `godsun108/earth-now` | Portal presents the instrument; EARTH NOW owns observation ingestion, provenance, layers, timeline and archive. |
| WINDOW | `godsun108/window-earth` | Portal presents the experience; WINDOW owns verified cameras, truth labels, SEEKER/discovery, ranking and route-camera logic. |
| ORACLE | Portal only | Personal probability-calibration experience. It does **not** expose or imply signals from Oracle Options Lab or SELDON. |
| TIME MACHINE | Portal only | Fictional/historical exploration. EDGE TIME MACHINE separately owns resurfacing of user-captured memory. |
| World Engine | Portal | Browser-local narrative state and cross-room consequences. It must not become a competing data/research engine. |

## Other canonical systems

- `godsun108/-oracle-options-lab` — empirical market-signal research, proof-of-edge gates, walk-forward and paper-forward evidence.
- `godsun108/Seldon` — falsifiable aggregate world-state forecasting and calibration.
- `godsun108/edge-intelligence` — RADAR / SAVANT / SENSE / TIME MACHINE intelligence and evidence workflow.
- `godsun108/Mint-capital-engine` — lawful capital/opportunity execution and settlement accounting.
- `godsun108/turbo-foundry` — engineering standard plus Base One Engine.
- `godsun108/victorychain_stack` — Victory ecosystem; its own canonical architecture document governs legacy-vs-current boundaries.
- `godsun108/soul-key` — experimental presence-recognition research; never production wallet authorization.

## Integration doctrine

Before adding a substantial capability:

1. Search the existing ecosystem.
2. Identify the canonical owner.
3. Consume its public contract/output when possible.
4. Keep presentation/narrative state in Portal.
5. Do not copy credentials, private APIs, research authority, or scientific claims into Portal.
6. If no canonical capability exists, build the smallest useful system and decide where it belongs before expanding it.

## Current integrations

- Portal WINDOW consumes the canonical WINDOW verified-camera registry.
- Portal EARTH embeds the canonical EARTH NOW instrument.
- World Engine remains browser-local and may remember visits/interactions without altering source truth.

## Privacy / deployment

Portal remains GitHub-Pages friendly and contains no credentials, wallets or privileged integrations. Browser-local state is used for its persistent world mechanics.


## Music Foundry (preview integration)

The ART station includes a Music Foundry room on the `music-foundry/portal-integration-preview` branch. Its local recording booth is mirrored from the canonical `godsun108/turbo-foundry` implementation; the mirror records the source commit in an HTML comment. Keep Turbo Foundry as the source of truth and refresh the Portal mirror when the canonical booth changes. The booth requests microphone permission only after an explicit Record action, exports local WAV files, and does not upload recordings. iPhone/Safari runtime behavior remains unverified until tested on a device. This preview branch is intentionally not published or merged.

The Music Foundry preview also mirrors the browser-local vocal timeline editor from Turbo Foundry. It imports the spoken-take manifest and selected WAV files, edits five vocal layers, previews timing, and renders a WAV mix/stems in-browser. Canonical implementation and test suite remain in Turbo Foundry; keep the Portal mirror synchronized to the source commit noted in its HTML comment. Device-specific iPhone/Safari behavior is not yet verified. Preview only; not deployed.

The preview timeline includes section markers for the 56-bar, 127 BPM arrangement (intro, verses, pre, choruses, half-time bridge and outro). Its canonical source remains in Turbo Foundry; this page is a synchronized preview mirror.

The synchronized preview vocal timeline now includes local per-take saturation, low-pass filtering, feedback delay and tempo-locked stutter controls. The canonical effects implementation and offline assembler are maintained in Turbo Foundry; no provider or upload service is used.

The preview timeline now includes take-relative automation keyframes for gain, low-pass filter, delay wet and feedback. The canonical browser editor and offline renderer remain in Turbo Foundry; the Portal page is a synchronized preview mirror.

The preview timeline now mirrors Turbo Foundry's phrase performance editor: bounded phrase repeats, reverse playback and an optional repeat at the first chorus drop. Turbo Foundry remains the canonical source.

The Portal preview now mirrors the canonical Turbo Foundry vocal editor with per-take and per-lane mute/solo, isolated phrase audition, and 10 ms / 100 ms clip nudges. Mute/solo state is saved in the take manifest.

The Portal preview mirrors the canonical Turbo Foundry vocal editor, including two tempo-synced A/B loop regions, quarter/eighth/sixteenth/bar snapping at 127 BPM, A/B comparison playback, and bounded loop repetitions.
