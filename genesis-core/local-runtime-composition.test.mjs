import test from "node:test";
import assert from "node:assert/strict";
import { createGenesisLocalMind } from "./local-runtime-composition.mjs";

test("composes local runtime loader with Portal inference contract", async () => {
  const events = [];
  const mind = await createGenesisLocalMind({
    modulePath: "./mock-runtime.mjs",
    mind: "muse",
    importModule: async (path) => {
      events.push("import:" + path);
      return {
        async createRuntime() {
          return {
            async initialize() { events.push("initialized"); },
            async generate(request) {
              assert.equal(request.schema, "portal.chat.v1");
              assert.equal(request.mind, "muse");
              return { content: "Locally generated." };
            }
          };
        }
      };
    }
  });

  assert.equal(mind.mode, "local");
  assert.equal(mind.ready, true);
  assert.deepEqual(events, ["import:./mock-runtime.mjs", "initialized"]);
  const result = await mind.respond({ messages: [{ role: "user", content: "create" }] });
  assert.equal(result.schema, "portal.chat.v1");
  assert.equal(result.verified, true);
  assert.equal(result.message.content, "Locally generated.");
});

test("composition propagates runtime loading failure without a fallback", async () => {
  await assert.rejects(createGenesisLocalMind({
    modulePath: "./missing.mjs",
    importModule: async () => { throw new Error("local runtime unavailable"); }
  }), /local runtime unavailable/);
});
