# Portal Intelligence Server

Provider-neutral Node.js server for Portal Intelligence and the Observatory research pipeline.

## Routes

- `GET /health` — reports whether an inference URL is configured.
- `POST /chat` — verified `portal.chat.v1` chat response with bounded Portal discoveries.
- `POST /research` — verified `portal.research.analysis.v1` analysis for an explicitly submitted Observatory dataset.

The browser never receives provider credentials. Research data is sent only after the traveler explicitly presses **Send to Genesis** in the Observatory Data Desk.

## Configuration

- `MODEL_URL` — OpenAI-compatible chat-completions endpoint (required to answer).
- `MODEL_NAME` — model identifier when required.
- `MODEL_KEY` — optional bearer credential; keep it in Railway variables, never in GitHub Pages.
- `PORTAL_ORIGIN` — exact allowed browser origin; defaults to `https://godsun108.github.io`.
- `PORT` — assigned automatically by Railway.

This can point at a hosted model today and a self-hosted/open-weight inference server later without changing the Portal client.

## Local commands

```sh
npm test
npm start
```

Node.js 20 or newer is required. Tests use Node's built-in test runner and mock the upstream model; they do not need API keys or network access.

## Protections

The server applies exact-origin CORS, JSON content-type checks, request size bounds, chat role/message validation, a per-IP in-memory rate limit, and an upstream timeout. It does not persist prompts or research datasets. Imported research rows are treated as untrusted data, not instructions.

The Railway service is configured to run `npm test` as a pre-deploy check and `GET /health` as its health check. A configured URL does not itself prove the model is reachable; verify with a real health and controlled inference test after deployment.
