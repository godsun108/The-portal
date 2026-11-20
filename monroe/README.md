# Monroe Exploration Room

An original, mobile-first Portal experience for optional guided relaxation, local binaural-tone experiments, and private reflection.

## Status

Prototype v1. This is an educational/wellness exploration interface, not a clinical intervention, diagnostic instrument, or validated brainwave-entrainment system. It is not affiliated with or endorsed by the Monroe Institute.

## What it includes

- Explicit user-initiated stereo tone generation using the Web Audio API.
- Configurable carrier frequency, beat difference, conservative volume ceiling, and 5–30 minute session length.
- Pause, resume, and stop controls; audio is never autoplayed.
- Original guided-attention prompts, with no Monroe recordings or proprietary scripts.
- Browser-local journaling and plain-text export.
- A safety notice and evidence limitations visible in the experience.

## Architecture and privacy

The page is self-contained at `monroe/index.html`. Tone generation occurs in the browser; no remote audio assets, microphone access, account, network request, or server are required. Journal text is stored only in browser localStorage under `portal.monroe.journal.v1` and can be exported or cleared by the user. Browser storage is not encrypted and may be removed by the browser.

## Scientific framing

The binaural effect is an auditory percept produced by presenting slightly different tones to the two ears. Do not equate the selected beat difference with a measured brainwave state. Research on reliable entrainment and downstream benefits is mixed and does not justify medical or extraordinary claims. Future experiments should pre-register hypotheses, record methods and limitations, distinguish subjective reports from physiological measurements, and avoid presenting correlation as causation.

## Safety

Keep volume low; do not use while driving, cycling, or operating machinery. Stop if uncomfortable. People with seizure disorders, significant sound sensitivity, or conditions affected by sensory stimulation should seek qualified clinical advice before use. This is not medical advice or treatment.

## Intellectual property

This is an independent implementation. It does not reproduce Monroe Institute audio, scripts, course materials, or proprietary protocols. The name is used descriptively to identify the area of inspiration; the experience is not an official Monroe Institute product.
