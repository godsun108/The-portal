# Starfall asset release proposals

The browser Asset Foundry exports a transparent PNG and a matching JSON manifest. It never receives a GitHub credential or publishes code.

The current manual proposal workflow accepts **SVG only**, for Fire Horse or Solar Lion. It is a gated path for reviewed SVG atlases; PNG support requires a separate validated release workflow. Place a candidate SVG and matching JSON in this `staging/` folder using a GitHub branch and pull request, with names `fire-horse.svg` and `fire-horse.json` (or `solar-lion.*`). The JSON image path must be `./assets/<hull>.svg`. Do not merge unreviewed or untrusted SVG.

After staged files are merged to main, open GitHub Actions → **Propose Starfall asset release** → Run workflow, select the hull. The workflow validates staged dimensions and allowed content, copies the staged files to the live asset paths, runs existing tests, and proposes a pull request for review. It never merges that PR. If the bot lacks permission to open pull requests, an administrator must enable that GitHub Actions permission.

This is not a one-tap mobile upload and is not a production deployment system. A future authenticated service may automate staging and approval without giving credentials to the public browser.
