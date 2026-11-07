# Sovereign iPhone Operator

This is the HTTPS, static iPhone-side controller for the existing Sovereign Web OS execution bridge.

## Pairing

1. Run Sovereign Offline's local Node host on the desktop and serve the existing Web OS from the SOVEREIGN_WEB_OS_ROOT setting.
2. Open the desktop page at http://127.0.0.1:7777/webos/?sovereignHost=1.
3. Open this page over HTTPS on the iPhone (after the Portal change is published).
4. Create a phone offer, copy it to the desktop, and paste it into the desktop Web OS offer field. Copy the desktop answer back to the phone.
5. Compare the complete DTLS fingerprints using a separate trusted channel. Approve each peer independently.
6. The phone can then request workspace listing, bounded file reads, or a command already allowlisted by the desktop's local Sovereign Offline policy. The desktop asks for owner confirmation before every request.

No hosted signaling relay, STUN/TURN server, cloud execution worker, or third-party command service is required. Manual signaling and direct WebRTC depend on network reachability and may fail behind restrictive NAT/firewall configurations.

## Offline behavior

The service worker caches the static controller and its owned modules after the first HTTPS visit. It can then open as an installed/offline page, but a desktop host must still be online and connected for remote execution.

## Source of truth and security

The protocol and transport source of truth lives in Sovereign-Core/earthchain/web-os/. This Portal folder contains exact copies of the transport, peer-approval and execution-protocol modules for GitHub Pages delivery. Keep them byte-identical when the source modules change.

This is experimental. Device identity, enrollment, revocation and replay persistence are not yet durable. The manual DTLS fingerprint check is mandatory. Do not use this controller for secrets, wallet operations, financial actions or destructive commands.
## Genesis Sight device intake

Open `sight.html` from the HTTPS Portal deployment and allow camera access when prompted. Sight can capture a frame locally, scan supported QR/barcodes, and collect user-entered device details. The frame is not uploaded and is cleared when the page is closed.

Choose **Assess connection options** to generate a preliminary category-based assessment. It reports browser APIs exposed in the current browser and lists integrations that would require a native agent, vendor support, or a future authenticated pairing flow. It does not probe the local network or contact the target device.

Choose **Build device profile** to create a JSON record containing the observations, evidence provenance, preliminary assessment, and all-false permission flags. Manufacturer/model entries remain unverified, and QR/barcode values are treated as untrusted observations. AI visual recognition, QR-based pairing, and universal casting are not implemented.

The assessment unit tests run with:

```sh
node --test earthchain-test/sovereign-operator/*.test.mjs
```

## QR-assisted signed pairing

1. The desktop-side execution host currently depends on Sovereign-Core PR #59, and the local static host depends on Sovereign-Offline PR #8. Once those changes are available in the desktop checkout, open the Sovereign Web OS at `http://127.0.0.1:7777/webos/?sovereignHost=1` (or enter the exact matching desktop origin in the phone's invitation field).
2. On the phone, create a fresh two-minute pairing QR and show it to the desktop.
3. On the desktop Web OS, use **Scan QR invitation**. The QR is an invitation envelope, not an access grant.
4. Create the phone offer and paste it into the desktop Web OS connection controls. The desktop verifies the invitation-bound P-256 signature before answering.
5. Paste the desktop's signed answer back into the phone. The phone verifies it against the exact invitation and offer.
6. Both sides still compare and approve the DTLS fingerprint through a separate trusted channel.

The QR invitation, signed offer, and signed answer modules are copied from their current Sovereign-Core sources. The phone execution client also depends on the bounded host protocol in Sovereign-Core PR #59; the local desktop serving route is supplied by Sovereign-Offline PR #8. They are experimental and do not establish durable device enrollment or revocation. The invitation expires after two minutes. Keep the manual unsigned flow available only for controlled lab use.

## First physical smoke test

Do not run this until Sovereign-Core PR #59 and Sovereign-Offline PR #8 are present in the desktop checkout and the desktop owner has configured a narrow `workspace.json` allowlist.

1. Put the iPhone and test computer on the same trusted Wi-Fi network.
2. Start the Sovereign Offline local Node host. On the computer, open `http://127.0.0.1:7777/webos/?sovereignHost=1`.
3. Open this Portal controller over HTTPS on the iPhone and create a fresh pairing QR.
4. On the computer, scan the QR invitation. Create the phone's signed offer, paste it into the desktop connection controls, and return the signed answer to the phone.
5. Compare the complete DTLS fingerprints through a separate trusted channel. Independently approve the peer on both devices.
6. Confirm the desktop announces its host ID and bounded capabilities. Start with workspace listing and a harmless read-only file request.
7. Only then try a harmless command already allowlisted by the desktop owner. Confirm the desktop's separate approval prompt and inspect its local receipt/audit output.
8. Disconnect and record the device/browser versions, network conditions, and any errors. Do not test destructive commands, financial actions, or secrets.

A successful unit test or CI run is not a substitute for this physical iPhone/desktop test.