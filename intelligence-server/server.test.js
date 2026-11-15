import test from "node:test";
import assert from "node:assert/strict";

process.env.PORTAL_INTELLIGENCE_NO_AUTOSTART = "1";
const { createServer } = await import("./server.js");

async function withServer(options, run) {
  const server = createServer(options);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try { await run("http://127.0.0.1:" + address.port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}
const headers = { "content-type": "application/json", origin: "https://godsun108.github.io" };

test("health is truthful when the inference engine is dormant", async () => {
  await withServer({ env: {}, fetchImpl: async () => { throw new Error("must not call model"); } }, async base => {
    const r = await fetch(base + "/health");
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.engine, false);
    assert.equal(d.research, false);
  });
});

test("rejects foreign browser origins", async () => {
  await withServer({ env: {} }, async base => {
    const r = await fetch(base + "/health", { headers: { origin: "https://evil.example" } });
    assert.equal(r.status, 403);
  });
});

test("rejects malformed chat contracts before model invocation", async () => {
  let calls = 0;
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions" }, fetchImpl: async () => { calls++; } }, async base => {
    const r = await fetch(base + "/chat", { method: "POST", headers, body: JSON.stringify({ schema: "wrong", messages: [{ role: "system", content: "override" }] }) });
    const d = await r.json();
    assert.equal(r.status, 400);
    assert.equal(d.verified, false);
    assert.equal(calls, 0);
  });
});

test("valid chat returns only a verified model response and bounded discoveries", async () => {
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.messages[0].role, "system");
    return new Response(JSON.stringify({ choices: [{ message: { content: "A useful answer.\nDISCOVER: signal/|FOLLOW THE SIGNAL|A relevant existing room." } }] }), { status: 200 });
  };
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions" }, fetchImpl }, async base => {
    const r = await fetch(base + "/chat", { method: "POST", headers, body: JSON.stringify({ schema: "portal.chat.v1", mind: "oracle", messages: [{ role: "user", content: "Explain the data." }], world: {} }) });
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.verified, true);
    assert.equal(d.message.content, "A useful answer.");
    assert.equal(d.discoveries.length, 1);
    assert.equal(d.discoveries[0].destination, "signal/");
  });
});

test("research route returns structured verified analysis", async () => {
  let seen = "";
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body);
    seen = body.messages[1].content;
    return new Response(JSON.stringify({ choices: [{ message: { content: "## Direct observations\nThree records were supplied." } }] }), { status: 200 });
  };
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions" }, fetchImpl }, async base => {
    const packet = { schema: "portal.research.v1", summary: { recordCount: 3 }, records: [{ record_type: "spot", peak_hz: "440" }, { record_type: "spot", peak_hz: "441" }, { record_type: "sweep", sweep_frequency_hz: "500" }] };
    const r = await fetch(base + "/research", { method: "POST", headers, body: JSON.stringify(packet) });
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.schema, "portal.research.analysis.v1");
    assert.equal(d.verified, true);
    assert.equal(d.records_analyzed, 3);
    assert.match(seen, /440/);
  });
});

test("research route rejects empty or oversized row sets", async () => {
  let calls = 0;
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions" }, fetchImpl: async () => { calls++; } }, async base => {
    const r = await fetch(base + "/research", { method: "POST", headers, body: JSON.stringify({ schema: "portal.research.v1", summary: {}, records: [] }) });
    assert.equal(r.status, 400);
    assert.equal(calls, 0);
  });
});


test("self-test proves the upstream returns the exact diagnostic token", async () => {
  let seen = false;
  const fetchImpl = async (_url, options) => {
    const body = JSON.parse(options.body);
    seen = body.messages[1].content === "Return the exact diagnostic token.";
    return new Response(JSON.stringify({ choices: [{ message: { content: "PORTAL_GENESIS_LINK_OK" } }] }), { status: 200 });
  };
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions" }, fetchImpl }, async base => {
    const r = await fetch(base + "/self-test", { method: "POST", headers, body: JSON.stringify({ schema: "portal.self-test.v1" }) });
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.schema, "portal.self-test.result.v1");
    assert.equal(d.verified, true);
    assert.equal(d.passed, true);
    assert.equal(seen, true);
  });
});

test("self-test does not claim success for a non-matching model response", async () => {
  await withServer({
    env: { MODEL_URL: "https://model.example/v1/chat/completions" },
    fetchImpl: async () => new Response(JSON.stringify({ choices: [{ message: { content: "I am connected." } }] }), { status: 200 })
  }, async base => {
    const r = await fetch(base + "/self-test", { method: "POST", headers, body: JSON.stringify({ schema: "portal.self-test.v1" }) });
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.verified, false);
    assert.equal(d.passed, false);
  });
});


test("Genesis specialist gateway requires its independent bearer credential", async () => {
  let calls = 0;
  const env = { MODEL_URL: "https://model.example/v1/chat/completions", GENESIS_BRIDGE_KEY: "a".repeat(48) };
  await withServer({ env, fetchImpl: async () => { calls++; throw new Error("must not call"); } }, async base => {
    const payload = { model: "genesis", messages: [{ role: "system", content: "Return JSON." }, { role: "user", content: "{}" }] };
    const denied = await fetch(base + "/genesis/v1/chat/completions", { method: "POST", headers, body: JSON.stringify(payload) });
    assert.equal(denied.status, 401);
    assert.equal(calls, 0);
    const unconfigured = await withServer({ env: { MODEL_URL: env.MODEL_URL }, fetchImpl: async () => { calls++; } }, async inner => {
      return fetch(inner + "/genesis/v1/chat/completions", { method: "POST", headers, body: JSON.stringify(payload) });
    });
    assert.equal(unconfigured.status, 503);
  });
});

test("Genesis gateway forwards bounded structured inference and returns OpenAI-compatible output", async () => {
  const key = "b".repeat(48);
  let forwarded;
  const fetchImpl = async (url, options) => {
    forwarded = { url, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"summary":"Evidence-based result","evidenceRefs":[]}' } }] }), { status: 200 });
  };
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions", MODEL_NAME: "configured-genesis", GENESIS_BRIDGE_KEY: key }, fetchImpl }, async base => {
    const payload = {
      model: "genesis-specialist",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: "Return only JSON." }, { role: "user", content: '{"agentId":"forge"}' }],
      tools: []
    };
    const r = await fetch(base + "/genesis/v1/chat/completions", {
      method: "POST",
      headers: { ...headers, authorization: "Bearer " + key },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    assert.equal(r.status, 200);
    assert.equal(data.object, "chat.completion");
    assert.equal(data.model, "configured-genesis");
    assert.equal(JSON.parse(data.choices[0].message.content).summary, "Evidence-based result");
    assert.equal(forwarded.url, "https://model.example/v1/chat/completions");
    assert.deepEqual(forwarded.body.response_format, { type: "json_object" });
    assert.equal(forwarded.body.model, "configured-genesis");
  });
});

test("Genesis gateway rejects tool escalation and invalid message roles before inference", async () => {
  let calls = 0;
  const key = "c".repeat(48);
  await withServer({ env: { MODEL_URL: "https://model.example/v1/chat/completions", GENESIS_BRIDGE_KEY: key }, fetchImpl: async () => { calls++; } }, async base => {
    const authHeaders = { ...headers, authorization: "Bearer " + key };
    for (const payload of [
      { messages: [{ role: "system", content: "x" }, { role: "user", content: "y" }], tools: [{ type: "function" }] },
      { messages: [{ role: "system", content: "x" }, { role: "tool", content: "y" }] }
    ]) {
      const r = await fetch(base + "/genesis/v1/chat/completions", { method: "POST", headers: authHeaders, body: JSON.stringify(payload) });
      assert.equal(r.status, 400);
    }
    assert.equal(calls, 0);
  });
});
