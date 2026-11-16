import test from "node:test";
import assert from "node:assert/strict";
import { createGenesisCore } from "./autonomous-core.mjs";

test("plans and executes registered tools, evaluating results", async () => {
  const core = createGenesisCore({
    tools: { inspect: { capability: "read-workspace", run: async ({ path }) => ({ ok: true, path }) } },
    clock: () => "2026-10-29T12:00:00.000Z",
  });
  const task = core.inspectGoal("Inspect workspace");
  const planned = core.plan(task, [{ tool: "inspect", input: { path: "src" } }]);
  const result = await core.execute(planned);
  assert.equal(result.status, "completed");
  assert.equal(result.results[0].result.path, "src");
});

test("blocks consequential actions until explicit approval", async () => {
  let called = false;
  const core = createGenesisCore({
    tools: { trade: { capability: "place-trade", run: async () => { called = true; return { ok: true }; } } },
  });
  const planned = core.plan(core.inspectGoal("Analyze and trade"), [{ tool: "trade" }]);
  assert.equal(planned.steps[0].approvalRequired, true);
  const blocked = await core.execute(planned);
  assert.equal(blocked.status, "blocked");
  assert.equal(called, false);
  const approved = await core.execute(planned, { approvals: new Set([planned.steps[0].id]) });
  assert.equal(approved.status, "completed");
  assert.equal(called, true);
});

test("stops after failed evaluation", async () => {
  let secondCalled = false;
  const core = createGenesisCore({
    tools: {
      first: { run: async () => ({ ok: false }) },
      second: { run: async () => { secondCalled = true; return { ok: true }; } },
    },
  });
  const planned = core.plan(core.inspectGoal("Run sequence"), [{ tool: "first" }, { tool: "second" }]);
  const result = await core.execute(planned);
  assert.equal(result.status, "failed");
  assert.equal(secondCalled, false);
});

test("memory adapter persists and retrieves value", async () => {
  const store = new Map();
  const core = createGenesisCore({ memory: { async get(k) { return store.get(k); }, async put(k, v) { store.set(k, v); } } });
  await core.remember("project", { branch: "genesis" });
  assert.deepEqual(await core.recall("project"), { branch: "genesis" });
});

test("rejects unknown tools and empty goals", () => {
  const core = createGenesisCore();
  assert.throws(() => core.inspectGoal(" "), /non-empty/);
  assert.throws(() => core.plan(core.inspectGoal("x"), [{ tool: "missing" }]), /unknown tool/);
});
