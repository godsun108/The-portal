# Living Scriptures — iPhone / editorial acceptance checklist

This is a manual review worksheet for the development branch. Automated Chromium and simulated mobile WebKit tests do not replace physical-device accessibility acceptance.

## Latest verified automation
- GitHub Actions run https://github.com/godsun108/The-portal/actions/runs/40158544170 completed successfully: browser-tests, official-web-source-audit, and stage-chapter-corpus.
- This is not evidence of physical iPhone Safari or VoiceOver acceptance.

## Access
Review a temporary HTTPS preview **only if explicitly enabled**. Do not assume a branch-only GitHub URL is a playable GitHub Pages site. Do not merge or deploy solely to run this checklist.

## iPhone Safari (physical device)
- On Safari, verify navigation from the PORTAL library station to the catalog, reader, and source comparison.
- Open Genesis 1, John 3, Psalms 23, and a deuterocanonical book included in the WEB edition. Verify readable, complete content and source links.
- Select **Save this book offline**, confirm success, turn on airplane mode, and open a chapter not yet viewed. Repeat after closing/reopening Safari; note that iOS may evict web storage.
- Verify focus, selection, 200% text zoom, long titles, and no horizontal scrolling.
- Turn on VoiceOver: headings, book/chapter selectors, verse numbers, expandable source notes, progress messages, and back navigation should make sense in reading order.
- Verify low-light and bright-light contrast, landscape rotation, and offline failure messages.

## Editorial verification (independent of app tests)
- Compare Genesis 1, John 3, Psalm 119 and selected deuterocanonical chapters line by line against the pinned official WEB source.
- Check poetic lines, paragraphs, footnotes, cross-references, right-to-left excerpts, section headings, text attributes, split verse numbers, and end-of-book material.
- Verify the edition name, public-domain reuse statement, source URL, and original archive SHA-256. Do not mistake structural completeness for textual rendering accuracy.
- Review canon/tradition labels for Jewish, Catholic, Protestant, Orthodox, and Ethiopian materials; the WEB ecumenical edition must not be represented as all of these canons.

## Reproducible physical-device test record
For each test, record date, iPhone model, iOS/Safari version, exact HTTPS preview URL or file location, steps performed, observed result, screenshot/video if available, and reviewer. Do not mark a check PASS based on a static file preview when the gate requires the complete web application.

1. Online: load the **complete reader** over HTTPS; confirm all 81 book choices and open Genesis 1, Psalm 23, John 3, Tobit 1. Record source-link destinations.
2. Offline: while online, save Genesis; wait for the explicit 50-chapter success message; turn on airplane mode; load Genesis 2, close/reopen Safari and load Genesis 3. A partial-cache message is not a pass.
3. Accessibility: enable VoiceOver and navigate heading, Book, Chapter, Read, verse number, source notes, and status. Test at 200% text zoom and landscape orientation; note clipping or inaccessible controls.
4. Editorial: compare the projected verse text and note disclosure to the official pinned source for representative passages and difficult markup; record discrepancies before sign-off.
5. Stop conditions: failed load, unexpected missing verse, incorrect attribution, silent substitution, or offline reopening failure blocks public release pending investigation.

## Acceptance record
| Gate | Evidence / reviewer | Result |
| --- | --- | --- |
| Physical iPhone Safari online / offline | Not supplied | Pending |
| VoiceOver and enlarged text | Not supplied | Pending |
| Edition and per-verse visual comparison | Not supplied | Pending |
| Licensing and attribution | Not independently signed off | Pending |
| Release approval | Not supplied | Pending |

No approval or result should be recorded without dated evidence.
