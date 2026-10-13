# EarthID challenge store boundary

This module issues 256-bit unpredictable challenges, hashes stored values, binds each to a synthetic account ID and registration/authentication ceremony, expires them, and consumes them at most once. It is an in-memory **local test fixture** and is not a passkey implementation.

Do not treat `consume() === true` as login success. A vetted WebAuthn verifier must validate the signed authenticator response, expected origin, RP ID, challenge, credential identity, user verification requirements and signature, and only then authorize account login or credential registration. For production, bind ceremonies to an authenticated onboarding/session context, use durable atomic consume operations and rate limits, and handle concurrent requests and restart recovery. Do not expose this module as a public endpoint.

Run: `node --test genesis-core/challenges.test.mjs`.
