/**
 * Genesis Autonomous Core — bounded task orchestration primitives.
 *
 * This module is not an LLM and does not claim consciousness or general reasoning.
 * It supplies the deterministic scaffolding Genesis can use with a locally hosted
 * inference engine: goal records, capability-gated plans, approval boundaries,
 * execution, and evaluation.
 */

const FORBIDDEN_AUTONOMOUS_CAPABILITIES = new Set([
  "spend-money",
  "place-trade",
  "publish-publicly",
  "deploy-production",
  "delete-user-data",
  "change-security-policy",
]);

export function createGenesisCore({
  tools = {},
  memory = { async get() { return null; }, async put() {} },
  evaluator = async ({ result }) => ({ passed: result?.ok === true, reason: result?.ok === true ? "tool reported success" : "tool did not report success" }),
  clock = () => new Date().toISOString(),
} = {}) {
  const toolRegistry = new Map(Object.entries(tools));

  function inspectGoal(goal) {
    if (typeof goal !== "string" || !goal.trim()) throw new TypeError("goal must be a non-empty string");
    return {
      id: createId(),
      goal: goal.trim(),
      createdAt: clock(),
      status: "proposed",
      steps: [],
      results: [],
    };
  }

  function plan(task, steps) {
    if (!task || typeof task.goal !== "string") throw new TypeError("task required");
    if (!Array.isArray(steps) || steps.length === 0) throw new TypeError("plan must contain at least one step");
    const normalized = steps.map((step, index) => {
      if (!step || typeof step.tool !== "string" || !toolRegistry.has(step.tool)) {
        throw new Error(`unknown tool at step ${index}`);
      }
      const capability = toolRegistry.get(step.tool).capability || step.tool;
      const approvalRequired = step.approvalRequired === true ||
        FORBIDDEN_AUTONOMOUS_CAPABILITIES.has(capability) ||
        toolRegistry.get(step.tool).approvalRequired === true;
      return {
        id: `${task.id}-step-${index + 1}`,
        tool: step.tool,
        input: step.input ?? {},
        capability,
        approvalRequired,
        status: approvalRequired ? "approval_required" : "ready",
      };
    });
    return { ...task, status: "planned", steps: normalized };
  }

  async function execute(task, { approvals = new Set() } = {}) {
    if (!task || !Array.isArray(task.steps)) throw new TypeError("planned task required");
    const results = [];
    for (const step of task.steps) {
      if (step.approvalRequired && !approvals.has(step.id)) {
        results.push({ stepId: step.id, status: "blocked", reason: "explicit approval required" });
        break;
      }
      const tool = toolRegistry.get(step.tool);
      if (!tool || typeof tool.run !== "function") {
        results.push({ stepId: step.id, status: "failed", reason: "tool unavailable" });
        break;
      }
      try {
        const result = await tool.run(step.input);
        const evaluation = await evaluator({ task, step, result });
        results.push({
          stepId: step.id,
          status: evaluation.passed ? "completed" : "failed",
          result,
          evaluation,
        });
        if (!evaluation.passed) break;
      } catch (error) {
        results.push({ stepId: step.id, status: "failed", reason: String(error?.message || error) });
        break;
      }
    }
    const status = results.length === task.steps.length && results.every(x => x.status === "completed")
      ? "completed"
      : results.some(x => x.status === "failed") ? "failed" : "blocked";
    return { ...task, status, results, completedAt: clock() };
  }

  async function remember(key, value) {
    if (typeof key !== "string" || !key.trim()) throw new TypeError("memory key required");
    await memory.put(key, { value, updatedAt: clock() });
  }

  async function recall(key) {
    const record = await memory.get(key);
    return record?.value ?? null;
  }

  function capabilities() {
    return [...toolRegistry.entries()].map(([name, tool]) => ({
      name,
      capability: tool.capability || name,
      approvalRequired: tool.approvalRequired === true ||
        FORBIDDEN_AUTONOMOUS_CAPABILITIES.has(tool.capability || name),
    }));
  }

  return Object.freeze({ inspectGoal, plan, execute, remember, recall, capabilities });
}

function createId() {
  return `genesis-task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
