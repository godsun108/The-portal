import test from "node:test";
import assert from "node:assert/strict";
import { createLocalInference } from "./local-inference.mjs";

test("local adapter returns the Portal chat contract from injected runtime", async () => {
  let request;
  const adapter = createLocalInference({
    mind: "architect",
    runtime: { async generate(value) { request = value; return { content: "  A local answer  " }; } }
  });
  const response = await adapter.respond({ messages: [{ role: "user", content: "hello" }] });
  assert.equal(request.mind, "architect");
  assert.equal(response.schema, "portal.chat.v1");
  assert.equal(response.verified, true);
  assert.equal(response.message.content, "A local answer");
});

test("adapter bounds message history and forwards world and abort signal", async () => {
  const controller = new AbortController();
  let request;
  const adapter = createLocalInference({
    maxMessages: 2,
    runtime: { async generate(value) { request = value; return { content: "ok" }; } }
  });
  await adapter.respond({
    messages: [
      { role: "user", content: "one" },
      { role: "assistant", content: "two" },
      { role: "user", content: "three" }
    ],
    world: { local: true },
    signal: controller.signal
  });
  assert.deepEqual(request.messages.map((x) => x.content), ["two", "three"]);
  assert.deepEqual(request.world, { local: true });
  assert.equal(request.signal, controller.signal);
});

test("adapter rejects missing runtime and malformed model output", async () => {
  assert.throws(() => createLocalInference(), /local runtime/);
  const adapter = createLocalInference({
    runtime: { async generate() { return { content: " " }; } }
  });
  await assert.rejects(adapter.respond({ messages: [{ role: "user", content: "hi" }] }),
    /no assistant content/);
});

test("adapter rejects unsupported roles", async () => {
  const adapter = createLocalInference({
    runtime: { async generate() { return { content: "ok" }; } }
  });
  await assert.rejects(adapter.respond({ messages: [{ role: "tool", content: "bad" }] }),
    /role is not supported/);
});
