# Starfall asset release proposals

The browser Asset Foundry exports `fire-horse.png` or `solar-lion.png` and a matching JSON manifest. No GitHub credentials are used in the browser.

To propose a release, add the exported PNG and JSON to this staging folder via a reviewed GitHub pull request. After staging is merged, open GitHub Actions → **Propose Starfall asset release** → Run workflow, choose the hull and **png**. The workflow checks manifest fields and PNG header dimensions, runs existing unit tests and proposes a second PR to copy the asset to the game path. Review and merge manually. The image path in JSON must be `./assets/<hull>.png`.

SVG staging is also supported: stage `<hull>.svg` plus JSON with `image: "./assets/<hull>.svg"`, then select **svg**. SVG checks include basic active-content filtering and geometry validation.

**Limitations:** The PNG check validates signature, format, size and dimensions but does not fully decode or CRC-check the image. Browser acceptance testing is still necessary. No automatic upload, no automatic merging, no payment or wallet access. GitHub Actions must have permission to create PRs. This is a reviewed GitHub workflow, not a one-tap iPhone publishing service.
