# EarthID — browser-compatible passkey options, local-only

This module wraps the maintained SimpleWebAuthn 14 server-side `generateRegistrationOptions` and `generateAuthenticationOptions` APIs and consumes our existing challenge issuer. It produces standards-shaped options for an eventual iPhone browser ceremony, with ES256, resident credentials and required user verification. A stable 32-byte SHA-256-derived opaque user handle is used instead of an email address.

## Trust boundary
`trustedAccountId`, `trustedUserName` and credential allow/exclude lists MUST be derived from trusted server-side database/account state. Do not expose these option methods as unauthenticated account registration endpoints. The challenge issuance is still in-memory and must be tied to a durable server-side ceremony handle before use.

The generator passes the challenge as raw decoded bytes so the returned base64url challenge matches the existing challenge store value. The RP ID must be configured for the eventual HTTPS domain; GitHub Pages does not supply a private API or a standalone WebAuthn identity backend. No passkey browser UI, HTTPS endpoint, real user provisioning, account recovery, rate limiting, or production deployment is introduced here.

Testing: `node --test genesis-core/browser-passkey-options.test.mjs` after installing dependencies.
