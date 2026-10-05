# PORTAL TV

## Current status: v0.2 browser prototype

Open `tv.html` in a browser. Includes HTML5 playback of device-local video files, user-supplied authorized direct HTTPS MP4/WebM/Ogg files, fullscreen, six thematic placeholder channels, and browser-local saved program guide (up to 100 entries). No account or API key required. A saved URL does not guarantee a server permits cross-origin streaming or that its file remains available. Local file selection does not upload the file.

## Broadcast truth

Channels are labeled placeholders, not claims of live streams. No copyrighted content is bundled, and no DRM or paywall bypass is provided. Future integrations must use licensed media or official permitted embeds. Do not claim deployed streaming, tested uptime, or populated live schedules until independently verified.

## Next engineering steps

- Verify browser functionality on desktop and iOS, add automated UI tests.
- Integrate navigation from Portal's existing entrypoint after inspecting its structure.
- Add first-party original program manifest with licensed sources, metadata and schedule.
- Introduce a user-controlled export/import of browser-local guide.
- If live programming is desired, add an authorized HLS playback path and real program guide data.
