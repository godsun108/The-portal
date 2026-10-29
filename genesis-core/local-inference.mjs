const CHAT_SCHEMA = "portal.chat.v1";

function assert(condition, message) {
  if (!condition) throw new TypeError(message);
}

/**
 * Creates a provider-free adapter around an explicitly injected local runtime.
 * This module performs no network access and loads no model weights itself.
 */
export function createLocalInference({ runtime, mind = "portal", maxMessages = 20 } = {}) {
  assert(runtime && typeof runtime.generate === "function",
    "A local runtime with generate(request) is required.");
  assert(typeof mind === "string" && mind.length > 0, "mind must be a non-empty string.");
  assert(Number.isInteger(maxMessages) && maxMessages > 0, "maxMessages must be a positive integer.");

  return Object.freeze({
    mode: "local",
    async respond({ messages, world = {}, signal } = {}) {
      assert(Array.isArray(messages) && messages.length > 0, "messages must be a non-empty array.");
      const bounded = messages.slice(-maxMessages).map((message) => {
        assert(message && ["user", "assistant", "system"].includes(message.role),
          "message role is not supported.");
        assert(typeof message.content === "string", "message content must be a string.");
        return { role: message.role, content: message.content };
      });

      const generated = await runtime.generate({
        schema: CHAT_SCHEMA,
        mind,
        messages: bounded,
        world,
        signal
      });

      assert(generated && typeof generated.content === "string" && generated.content.trim(),
        "local runtime returned no assistant content.");

      return {
        schema: CHAT_SCHEMA,
        verified: true,
        mind,
        message: { role: "assistant", content: generated.content.trim() }
      };
    }
  });
}
