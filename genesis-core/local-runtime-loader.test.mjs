import test from "node:test";
import assert from "node:assert/strict";
import { loadLocalRuntime } from "./local-runtime-loader.mjs";

test("loads and initializes an explicitly local runtime module", async () => {
  const events = [];
  const runtime = await loadLocalRuntime({
    modulePath: "./runtime.mjs",
    importModule: async (path) => {
      events.push("import:" + path);
      return {
        async createRuntime(options) {
          events.push("create:" + options.device);
          return {
            async initialize() { events.push("initialize"); },
            async generate(request) { return { content: request.prompt }; }
          };
        }
      };
    },
    options: { device: "local" }
  });
  assert.deepEqual(events, ["import:./runtime.mjs", "create:local", "initialize"]);
  assert.equal(runtime.ready, true);
  assert.deepEqual(await runtime.generate({ prompt: "hello" }), { content: "hello" });
});

test("rejects remote, absolute, and malformed module paths before import", async () => {
  for (const modulePath of ["https://example.com/runtime.js", "//example.com/runtime.js", "/tmp/runtime.js", "runtime.js"]) {
    let imported = false;
    await assert.rejects(loadLocalRuntime({
      modulePath,
      importModule: async () => { imported = true; return {}; }
    }), /local relative path/);
    assert.equal(imported, false);
  }
});

test("rejects modules without runtime factory or generate function", async () => {
  await assert.rejects(loadLocalRuntime({
    modulePath: "./bad.mjs",
    importModule: async () => ({})
  }), /export createRuntime/);

  await assert.rejects(loadLocalRuntime({
    modulePath: "./bad.mjs",
    importModule: async () => ({ async createRuntime() { return {}; } })
  }), /expose generate/);
});

test("does not mark runtime ready when initialization fails", async () => {
  await assert.rejects(loadLocalRuntime({
    modulePath: "./broken.mjs",
    importModule: async () => ({
      async createRuntime() {
        return {
          async initialize() { throw new Error("model load failed"); },
          async generate() { return { content: "never" }; }
        };
      }
    })
  }), /model load failed/);
});
