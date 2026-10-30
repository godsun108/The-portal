# EarthConnect Communications — implementation status and first slice

Status: architecture and integration plan. This document does not claim that messaging, voice calls, or video calls are live.

## Existing work verified

- `earthchain-genesis/index.html` and `app.js`: Earthchain super-app directory. EarthConnect is listed as planned.
- `earthsocial/`: social feed interface; not an identity or messaging backend.
- `earthvideo/`: video discovery/interface preview; not a calling service or production video host.
- `genesis-voice/`: browser speech recognition/text-to-speech and Genesis voice interface; not person-to-person calling.
- `docs/earthsound-earthconnect-plan.md`: product boundaries and staged implementation plan.
- Sovereign-Core `earthchain/web-os/`: experimental local WebRTC data-channel bridge and optional signaling relay.

## Communications space

EarthConnect should be the single communications home in the super app:

- **Messages** — direct and group conversations, durable history, delivery state.
- **Voice** — one-to-one voice calling.
- **Video** — one-to-one video calling, with camera/microphone permission controls.
- **Rooms** — group spaces and eventual group meetings.
- **Connections** — opt-in contact discovery, invitations, blocking and reporting.
- **EarthMesh** — future device-to-device/local peer connection path, clearly separated from normal internet calling.

## Safe first vertical slice

1. Add a mobile-first EarthConnect space to Portal and make it discoverable from the Earthchain Genesis directory.
2. Preserve/reuse the existing text experience rather than creating a second message store.
3. Show the Messages, Voice, Video, Rooms and Connections surfaces with truthful service readiness.
4. Keep call controls disabled until authenticated signaling, STUN/TURN connectivity, permission UX, abuse safeguards and two-device tests exist.
5. Keep EarthMesh experimental; a WebRTC data-channel demo is not an offline mesh network.

## Gates before enabling private communications

- Authenticated identity and device/session model.
- Membership-scoped message access and authorization tests.
- TLS, abuse/rate limits, block/report, invitation controls and data export/deletion.
- If end-to-end encryption is promised: reviewed key management, multi-device recovery and protocol tests before the claim.
- Voice/video: authenticated signaling, STUN/TURN, connection/reconnect handling, explicit device permissions, iPhone Safari testing.
- Group calling: evaluate SFU and bandwidth/egress cost; do not assume mesh scales.
- Test with two distinct authenticated devices/accounts before declaring a feature live.

## Non-goals of this slice

No production backend, credentials, storage bucket, vendor billing, media hosting, public call capability, or release/deployment is introduced by this plan. Public static Portal hosting alone cannot provide private persistent chat or reliable calling.
