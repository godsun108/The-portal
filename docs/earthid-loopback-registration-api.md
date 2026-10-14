# EarthID registration HTTP fixture — loopback only

This module joins the previously merged EarthID components into a local test API for **already authenticated synthetic accounts**. It exposes two routes only when a test explicitly starts the server: POST /register/options and POST /register/verify. The Node test binds an ephemeral port on 127.0.0.1.

Security protections:
- Exact HTTPS Origin and Fetch Metadata request checks, with session lookup from the existing `__Host-earthid` cookie
- Trusted account lookup based on the server-side authenticated subject; no account ID accepted from browser JSON
- One-time ceremony handle tied to the *same* browser session token that requested registration
- Handle consumed before any completion attempt, including cross-session and malformed attempts
- Real SimpleWebAuthn registration verifier and existing account-scoped credential store
- Bounded JSON requests and no protected details in denial responses

Limitations: **NOT a usable public login or registration service.** The tests simulate an HTTPS Origin header over loopback HTTP and use test-issued sessions rather than a secure account-onboarding flow. Browser cookie delivery under HTTPS, durable challenge/session bindings, CSRF tokens, rate limits, real iPhone passkeys, account recovery, production URL/origin setup, and security review are still required. This test only checks rejected malformed registration and cross-session denial; successful signed registration was exercised separately in the merged cryptographic ceremony tests.

Run after installing Genesis Core dependencies:
`node --test genesis-core/loopback-passkey-registration.test.mjs`.
