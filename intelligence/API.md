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
- No secret provider keys in GitHub Pages or browser storage.
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
