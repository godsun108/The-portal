# EarthID browser passkey client adapter

A small module connecting modern native browser WebAuthn to future **trusted same-origin HTTPS** server begin/finish functions. This is source code for future bundling, not a publicly linked sign-in screen.

- Uses native `PublicKeyCredential.parseCreationOptionsFromJSON` and `parseRequestOptionsFromJSON` for server-issued options, then `navigator.credentials.create/get`.
- Serializes browser results using `credential.toJSON()` and returns them to trusted server verification.
- Client reports success only when the server confirms `registered: true` or `authenticated: true`. It never treats the presence of a browser credential as proof of authorization.
- Requires a secure browsing context and appropriate platform support. Older iPhone Safari versions may need a vetted browser polyfill; verify compatibility before launch.
- No client-supplied account IDs, bearer tokens, localStorage credentials or fake success states are supported.

**Not yet a working user login:** there are no HTTPS begin/finish API endpoints, trusted account creation, logged-in HTTP cookie transport, recovery or iPhone live testing. Native WebAuthn prompts are not exercised by Node tests; test dependencies are mocked solely to verify transport flow and server success gating.

Test: `node --test genesis-core/browser-passkey-client.test.mjs`. CI includes this under the existing Genesis Core test glob.
