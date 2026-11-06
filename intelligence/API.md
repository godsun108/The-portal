# PORTAL INTELLIGENCE CONTRACT v1

Portal owns the intelligence experience. The browser must never contain a provider API key and must never pretend a model replied.

## Request

POST the configured `endpoint` with JSON:

```json
{"schema":"portal.chat.v1","mind":"portal","messages":[{"role":"user","content":"hello"}],"world":{}}
```

## Response

```json
{"schema":"portal.chat.v1","verified":true,"mind":"portal","message":{"role":"assistant","content":"..."}}
```

The client accepts a response only when `schema` is exactly `portal.chat.v1`, `verified` is true, and assistant content is a non-empty string.

## Truth rules

- No fabricated model output.
- No secret provider API keys in GitHub Pages, browser storage, client JavaScript, public snapshots, or Portal state.
- `endpoint:null` means intelligence is visibly dormant.
- Provider/model choice belongs behind the endpoint; the Portal UI is provider-neutral.
- Conversation memory is browser-local by default. A future server memory system requires an explicit contract and user-visible behavior.
- A self-hosted open-weight model can replace any initial backend without changing the room protocol.


## Discovery protocol

A verified intelligence may return up to the configured maximum number of discoveries alongside its message:

```json
{
  "schema":"portal.chat.v1",
  "verified":true,
  "mind":"architect",
  "message":{"role":"assistant","content":"I found a relationship worth crossing."},
  "discoveries":[
    {"schema":"portal.discovery.v1","destination":"signal/","label":"FOLLOW THE SIGNAL","reason":"A carried shard changed what Signal can reveal."}
  ]
}
```

Discovery is deliberately bounded. The browser accepts only destinations present in `config.json.discovery.allowed_destinations`; arbitrary URLs, scripts, provider links, and invented rooms are rejected. A discovery is a proposal from a verified mind, not proof that the destination contains the mind's claimed interpretation.

Accepted discoveries are stored locally as `portal-intelligence-discoveries` with the discovering mind and timestamp. This lets intelligences reveal connections in the existing Portal without granting them uncontrolled navigation or repository mutation.


## Optional bounded Game Master proposal

A verified response may include at most one `proposal` object. The browser treats it as untrusted model output until deterministic validation succeeds.

```json
{
  "schema": "portal.gm-proposal.v1",
  "type": "challenge",
  "title": "Stabilize the redshift",
  "reason": "A local REDSHIFT event is active.",
  "destination": "games/rift/",
  "objective": "Complete a RIFT run before the event expires."
}
```

Types are `challenge`, `route`, or `event`. Destinations and event IDs must be browser-allowlisted. Acceptance is always a separate traveler action. Proposals cannot grant artifacts, scars, secrets, physics, external capabilities, or claim that an action already occurred.

## Genesis research analysis route

The Observatory Data Desk can optionally send an imported dataset to a separately configured `research_endpoint`. The value must be a complete HTTPS URL ending in `/research`. It remains `null` until a server is deployed and tested; the browser never infers or guesses a deployment URL.

Request:

```json
{
  "schema": "portal.research.v1",
  "summary": { "recordCount": 3 },
  "records": [
    { "record_type": "spot", "peak_hz": "440" }
  ]
}
```

Verified response:

```json
{
  "schema": "portal.research.analysis.v1",
  "verified": true,
  "analysis": "## Direct observations\n...",
  "records_analyzed": 1
}
```

The server accepts at most 2,000 rows and a bounded serialized packet. It treats imported fields as untrusted data, applies a research-specific system instruction, and returns only a non-empty model response. The client must check the response schema and `verified` flag before displaying the analysis.

The research route is opt-in and separate from ordinary chat. Imported data is sent to the configured inference provider only after the traveler presses **Send to Genesis**. No dataset is stored by this endpoint. The user should avoid including personal or sensitive information in experiment notes.

## Server protections

The Node server enforces an exact allowed browser origin, JSON content type, bounded request size, role and message validation, per-IP in-memory rate limits, and a 60-second upstream timeout. Provider credentials remain server-side. `MODEL_KEY` is optional for self-hosted inference endpoints that do not require bearer authentication. Health output reports whether a model URL is configured but does not expose credentials.

