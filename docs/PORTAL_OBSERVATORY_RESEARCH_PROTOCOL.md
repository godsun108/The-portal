# Portal Observatory — Research Protocol

## Purpose

The Geometry & Resonance station is an educational exploration and first-pass measurement environment. It combines mathematical visualizations, idealized models, microphone observations, and user-authored experimental notes. These evidence classes must remain distinct.

## Evidence labels

- **Established model:** a mathematical or physical relationship with stated assumptions, such as the ideal rectangular-cavity mode equation.
- **Simulation:** a computed illustration, such as the two-source scalar-wave interference map or ideal dipole field.
- **Measurement:** a value captured by a device in a particular setup. Phone microphones are not calibrated reference instruments.
- **Hypothesis:** a proposed explanation that still needs a discriminating experiment.

A visualization is not a measurement. A measured correlation is not automatically a causal effect. No universal “golden frequency” or shape-specific special frequency is established by this station.

## Recommended acoustic comparison protocol

1. Define the question before collecting data. Example: “Does changing one cavity dimension shift the lowest measured response peak while the source and microphone positions remain fixed?”
2. Record cavity internal dimensions, construction/material, openings, contents, speaker model/position, microphone model/position, distance, room, date, and environmental conditions.
3. Change one independent variable at a time. When comparing shapes, document which quantity is held constant: volume, longest dimension, surface area, or another chosen constraint. These are different comparisons.
4. Capture a background/no-source baseline.
5. Keep speaker gain, playback level, microphone position, orientation, and room setup fixed.
6. Run at least three repeats per condition. Preserve every raw CSV export.
7. Compare repeatability and uncertainty before interpreting small differences.
8. If possible, repeat with a calibrated measurement microphone and a known reference signal.

## What the current sweep means

The current 80–2,000 Hz logarithmic sweep records microphone FFT-bin levels near the commanded instantaneous frequency. It is a first-pass response trace, not a calibrated transfer function or deconvolved swept-sine impulse response. Speaker response, room reflections, microphone response, operating-system processing, ambient noise, and timing/latency can all affect the result.

The strongest recorded sweep bin is descriptive only. It is not automatically a room resonance.

## CSV format

The export includes:

- `record_type`: `spot` or `sweep`
- `time`: ISO timestamp
- `shape`, `material`, `distance_m`
- `peak_hz`, `relative_level_dbfs`
- `sweep_frequency_hz`, `sweep_level_dbfs`
- `notes`

The Data Desk accepts this CSV format, calculates descriptive summaries, and can prepare a structured Genesis/Portal Intelligence analysis handoff. Imported rows remain in the current browser session; exporting the JSON report preserves the imported rows. The handoff is not transmitted to a model automatically.

## Genesis analysis response contract

When reviewing an exported packet, Genesis should return:

1. Direct observations supported by the supplied data.
2. Conclusions the data do not support.
3. Data-quality issues and missing metadata.
4. Competing explanations with calibrated confidence.
5. A controlled follow-up experiment with repeat count and controlled variables.
6. A clear separation of measurements, simulations, and hypotheses.

Genesis must not claim it ran an experiment, calibrated a microphone, or verified external facts unless it actually did so through a suitable instrument or source.

## Privacy and persistence

- Microphone analysis occurs in the browser and is not uploaded by the station.
- Journal entries use browser-local storage.
- CSV and JSON exports are explicit user-initiated downloads.
- Clearing browser storage or using a different browser/device may make local journal entries unavailable; export important work.
- The research handoff feature currently prepares text locally. Portal Intelligence's repository configuration has `endpoint: null` and `mode: dormant`; no live Genesis inference connection is claimed.
