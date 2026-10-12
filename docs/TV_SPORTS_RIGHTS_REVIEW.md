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


## Verified outreach routes (2026-10-12)

**ACC Digital Network:** Official ACC Digital Network contact form: https://theaccdn.com/ . ACC 2023–24 licensing document explicitly lists **cswofford@raycomsports.com** for requests to license ACC digital content beyond news-access guidelines. This is a published historical contact, not a confirmed current address.
Sources: https://theaccdn.com/ and https://s3.amazonaws.com/sidearm.sites/acc.sidearmsports.com/documents/2023/9/6/2023_24_ACC_Media_Guidelines_Media_Portal.pdf

**Africa24 Sport:** Africa24's published 2026 communications contact is **onana@africa24tv.com** (Gaëlle Stella Oyono). This is a communications contact, not a confirmed licensing department. Request routing to distribution/rights team.
Source: https://africa24tv.com/africa-24-can-2025-au-maroc-un-dispositif-editorial-exceptionnel/

### Permission-request draft — ACCDN
Subject: Request for approved ACC Digital Network live embed on PORTAL TV

Hello ACC Digital Network team,

We operate PORTAL TV, a web-based television guide and player at https://godsun108.github.io/The-portal/tv.html . We would like to explore adding ACC Digital Network programming to our existing in-page player with your authorization. Could you direct us to the appropriate distribution/licensing contact and let us know whether you offer an approved web embed, syndication arrangement, or player SDK? We would appreciate details on domain restrictions, US/international availability, advertising/monetization, attribution, permitted content, and whether the official stream may be embedded by an independent website. We will not publish the feed until the required permissions are established.

Thank you,
PORTAL TV

### Permission-request draft — Africa24 Sport
Subject: Distribution inquiry: approved Africa24 Sport player for PORTAL TV

Hello Africa24 team,

We are developing PORTAL TV (https://godsun108.github.io/The-portal/tv.html), a web-based guide with an integrated live player. We are interested in presenting Africa24 Sport through an officially approved third-party embed or distribution arrangement. Would you please connect us with your digital distribution or licensing team and share your embedding policy, technical player options, territories, advertising terms, attribution, and authorization process? We will not publish an unauthorized feed.

Thank you,
PORTAL TV

Status: outreach drafts prepared; **not sent**, no permissions granted, no new channels admitted.
