# Portal Intelligence Server

A provider-neutral server-side body for Portal Intelligence.

It exposes `GET /health` and `POST /chat`. The browser never receives model credentials.

Required engine configuration:
- `MODEL_URL` — an OpenAI-compatible chat-completions endpoint
- `MODEL_NAME` — model identifier when required
- `MODEL_KEY` — optional bearer credential
- `PORTAL_ORIGIN` — allowed browser origin (defaults to the Portal GitHub Pages origin)

This can point at a hosted model today and a self-hosted/open-weight inference server later without changing the Portal client.
