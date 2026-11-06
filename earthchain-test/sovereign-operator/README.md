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