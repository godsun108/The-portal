# PORTAL TV sports embed-rights review — 2026-10-12

The existing tv-sports-iphone-field-report.json records 14 iPhone tests (10 played, 4 failed). Playback does not establish redistribution or embedding authorization. None is approved for public PORTAL TV admission.

## ACC Digital Network
Previously played on iPhone. ACC's official media licensing guidelines reserve digital rights and restrict unlicensed use of event video; they do not grant PORTAL permission to embed the ACC Digital Network CDN feed.
Source: https://s3.amazonaws.com/sidearm.sites/acc.sidearmsports.com/documents/2023/9/6/2023_24_ACC_Media_Guidelines_Media_Portal.pdf
Next: obtain written permission or an official broadcaster-supported embed for PORTAL's domain.

## Africa 24 Sport
Previously played on iPhone. Africa24's official group site describes its sports channel and distribution through its own platforms. Its official live page is https://africa24sport.com/en-direct/ ; this does not by itself license direct HLS embedding by third parties.
Source: https://africa24group.com/en/services/
Official app support contact listed: digital.ana@africa24tv.com (verify before outreach).
Next: ask broadcaster for approved third-party player, allowed geographies, commercial use, and domain requirements.

## Admission process
1. Keep historical test results; do not ask the user to repeat 14 tests.
2. Verify explicit permission and record the scope and evidence for each channel.
3. Only then set rightsStatus=authorized_for_portal_embed and admitted=true for a previously playing HTTPS feed.
4. Run a focused iPhone check of the approved player.
5. Review remaining eight previously playing sports streams independently.

Current result: zero new sports streams authorized or admitted.
