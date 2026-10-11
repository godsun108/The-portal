# Bulk channel discovery (research-only)

Run `node tv-iptv-discover.cjs` from the repository root in Node 18+.

The script fetches iptv-org channel metadata, stream candidates and its DMCA/NSFW blocklist. It stages HTTPS HLS candidates in `tv-iptv-discovery.json`, grouped by genres including sports and business/finance. Entries requiring custom referrer/user-agent are excluded because ordinary iPhone browsers cannot reliably set these headers. Duplicate channels are suppressed.

**No channel is automatically added to PORTAL TV.** Discovery does not establish embedding or redistribution permission, playback reliability, or compatibility. Manually verify broadcaster authorization and test the stream on the actual iPhone before promotion into `tv-programs.json` and the direct-watch rail. Never treat candidate counts as playable-channel counts. The output is an ephemeral research artifact; review before committing.

Source: https://github.com/iptv-org/api
