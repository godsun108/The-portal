# Zero-cost HTTPS launch

The `earthchain/first-exchange/` folder is static-host ready. It contains `index.html`, the wallet page, the PWA manifest, and the offline cache worker. It makes no API calls and has no server-side custody.

## GitHub Pages

1. Put this folder in the approved public Portal repository under a clearly named path such as `/earthchain-test/`.
2. Enable Pages from the repository’s **Settings → Pages** using the existing branch/folder publishing configuration.
3. Open the resulting HTTPS URL in Safari and choose **Share → Add to Home Screen**.
4. Keep the page labeled **ECTEST / no monetary value**. Do not connect it to real assets, payment rails, or private identity data.

GitHub Pages supplies static delivery only. The co-signed journal remains in each participant’s browser and moves as public JSON files through the iPhone Share Sheet.

## Release gate

Before sharing the URL, verify the exact HTTPS origin, Ed25519 support, wallet backup/recovery, Safari file sharing, and the two-device round trip. Keep the Portal change as a draft until those checks pass.
