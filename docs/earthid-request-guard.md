# EarthID cookie-authenticated request origin guard

A small, reusable **local-only** request policy for a future EarthID HTTPS API. For state-changing methods, require an exact HTTPS Origin match, rejecting missing Origin and cross-site/same-site Fetch Metadata. Safe methods also reject explicitly cross-site requests. Nonstandard methods fail closed.

Invoke the guard **before** a cookie-authenticated mutation or any side effect. The request headers must come from the actual trusted HTTP server, never user-supplied JSON. Do not rely on a client-origin claim, CORS headers, or SameSite cookies alone for CSRF defense. For sensitive operations add unpredictable session-bound CSRF tokens, server session verification, host/proxy configuration, authorization, rate limits and audit logs. `OPTIONS` is only a syntactically safe method in this pure policy; a real server must enforce its own preflight policy.

This is not a service, authenticated endpoint or deployable login system. No infrastructure, sessions or real users are activated.

Test: `node --test genesis-core/request-guard.test.mjs`.
