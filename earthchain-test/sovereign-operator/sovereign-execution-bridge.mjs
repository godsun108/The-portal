// Sovereign execution messages carried over the existing authenticated WebRTC data channel.
// This module is transport-agnostic: the host owns policy and execution; the phone only requests.
const REQUEST_SCHEMA = "sovereign.execution.request.v1";
const RESPONSE_SCHEMA = "sovereign.execution.response.v1";
const MAX_MESSAGE_BYTES = 64 * 1024;
const ID = /^[A-Za-z0-9_-]{16,96}$/;
const DEVICE = /^[A-Za-z0-9_-]{3,64}$/;
const CAPABILITY = /^[a-z][a-z0-9._-]{1,63}$/;

function jsonSize(value) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

export function createExecutionRequest({
  requestId, nonce, deviceId, capability, input = {}, issuedAt = Date.now(), ttlMs = 30_000
} = {}) {
  if (!ID.test(requestId || "") || !ID.test(nonce || "")) throw Error("invalid_request_identity");
  if (!DEVICE.test(deviceId || "") || !CAPABILITY.test(capability || "")) throw Error("invalid_request_scope");
  if (!Number.isSafeInteger(issuedAt) || !Number.isInteger(ttlMs) || ttlMs < 1_000 || ttlMs > 60_000) {
    throw Error("invalid_request_time");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) throw Error("invalid_request_input");
  const request = {
    schema: REQUEST_SCHEMA, requestId, nonce, deviceId, capability,
    issuedAt, expiresAt: issuedAt + ttlMs, input
  };
  if (jsonSize(request) > MAX_MESSAGE_BYTES) throw Error("request_too_large");
  return Object.freeze(request);
}

export function validateExecutionRequest(request, {
  now = Date.now(), maxTtlMs = 60_000, clockSkewMs = 15_000,
  allowedCapabilities = []
} = {}) {
  if (!request || typeof request !== "object" || Array.isArray(request)) throw Error("invalid_request");
  if (jsonSize(request) > MAX_MESSAGE_BYTES) throw Error("request_too_large");
  if (request.schema !== REQUEST_SCHEMA) throw Error("invalid_schema");
  if (!ID.test(request.requestId || "") || !ID.test(request.nonce || "")) throw Error("invalid_request_identity");
  if (!DEVICE.test(request.deviceId || "") || !CAPABILITY.test(request.capability || "")) throw Error("invalid_request_scope");
  if (!Number.isSafeInteger(request.issuedAt) || !Number.isSafeInteger(request.expiresAt)) throw Error("invalid_request_time");
  if (request.issuedAt > now + clockSkewMs || request.expiresAt <= now) throw Error("request_expired_or_future");
  if (request.expiresAt <= request.issuedAt || request.expiresAt - request.issuedAt > maxTtlMs) throw Error("invalid_request_lifetime");
  if (!request.input || typeof request.input !== "object" || Array.isArray(request.input)) throw Error("invalid_request_input");
  if (!allowedCapabilities.includes(request.capability)) throw Error("capability_denied");
  return Object.freeze({
    requestId: request.requestId, nonce: request.nonce, deviceId: request.deviceId,
    capability: request.capability, issuedAt: request.issuedAt, expiresAt: request.expiresAt,
    input: request.input
  });
}

export function createExecutionHost({
  channel, deviceId, allowedCapabilities = [], isPeerApproved = () => false,
  approve = async () => false, execute, now = Date.now, maxPending = 4,
  onReceipt = () => {}
} = {}) {
  if (!channel || typeof channel.send !== "function" || typeof channel.addEventListener !== "function") {
    throw Error("data_channel_required");
  }
  if (!DEVICE.test(deviceId || "") || typeof execute !== "function" || typeof approve !== "function") {
    throw Error("invalid_host_configuration");
  }
  if (!Array.isArray(allowedCapabilities) || allowedCapabilities.some(x => !CAPABILITY.test(x))) {
    throw Error("invalid_capability_policy");
  }
  if (!Number.isInteger(maxPending) || maxPending < 1 || maxPending > 4) throw Error("invalid_pending_limit");
  const seen = new Set();
  let pending = 0, closed = false;

  const reply = value => {
    if (closed || channel.readyState !== "open") return false;
    let raw;
    try { raw = JSON.stringify(value); } catch { return false; }
    if (new TextEncoder().encode(raw).byteLength > MAX_MESSAGE_BYTES) return false;
    channel.send(raw);
    return true;
  };
  const remember = request => {
    if (seen.has(request.requestId) || seen.has(request.nonce)) return false;
    seen.add(request.requestId); seen.add(request.nonce);
    while (seen.size > 4096) seen.delete(seen.values().next().value);
    return true;
  };
  const reject = (requestId, reason) => reply({
    schema: RESPONSE_SCHEMA, requestId: typeof requestId === "string" ? requestId : null,
    status: "rejected", reason, completedAt: new Date(now()).toISOString()
  });

  async function handle(event) {
    let raw = event?.data;
    if (typeof raw !== "string" || new TextEncoder().encode(raw).byteLength > MAX_MESSAGE_BYTES) {
      reject(null, "invalid_message"); return;
    }
    let parsed;
    try { parsed = JSON.parse(raw); } catch { reject(null, "invalid_json"); return; }
    let request;
    try {
      request = validateExecutionRequest(parsed, { now: now(), allowedCapabilities });
    } catch (error) {
      reject(parsed?.requestId, error.message || "invalid_request"); return;
    }
    if (request.deviceId !== deviceId) { reject(request.requestId, "device_mismatch"); return; }
    if (!remember(request)) { reject(request.requestId, "replay_detected"); return; }
    if (pending >= maxPending) { reject(request.requestId, "host_busy"); return; }
    if (!isPeerApproved()) { reject(request.requestId, "peer_not_approved"); return; }
    pending++;
    try {
      const accepted = await approve(request);
      if (accepted !== true) { reject(request.requestId, "owner_denied"); return; }
      // Re-check expiry and peer approval after the human approval wait.
      if (request.expiresAt <= now()) { reject(request.requestId, "request_expired_during_approval"); return; }
      if (!isPeerApproved()) { reject(request.requestId, "peer_approval_revoked"); return; }
      const remainingMs = Math.max(1, request.expiresAt - now());
      const result = await execute(Object.freeze({
        requestId: request.requestId, deviceId: request.deviceId,
        capability: request.capability, input: request.input,
        timeoutMs: remainingMs, expiresAt: request.expiresAt
      }));
      const receipt = Object.freeze({
        schema: RESPONSE_SCHEMA, requestId: request.requestId, deviceId,
        capability: request.capability, status: "succeeded",
        completedAt: new Date(now()).toISOString(), result
      });
      let receiptBytes;
      try { receiptBytes = jsonSize(receipt); } catch { throw Error("invalid_execution_result"); }
      if (receiptBytes > MAX_MESSAGE_BYTES) { reject(request.requestId, "result_too_large"); return; }
      onReceipt(receipt);
      if (!reply(receipt)) reject(request.requestId, "receipt_delivery_failed");
    } catch (error) {
      reject(request.requestId, "execution_failed");
    } finally {
      pending--;
    }
  }

  channel.addEventListener("message", handle);
  return Object.freeze({
    close() { closed = true; channel.removeEventListener?.("message", handle); },
    get pending() { return pending; },
    get replayEntries() { return seen.size; }
  });
}

function randomId(prefix) {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, x => x.toString(16).padStart(2, "0")).join("");
}

export function createExecutionClient({ channel, deviceId, now = Date.now, responseTimeoutMs = 65_000 } = {}) {
  if (!channel || typeof channel.send !== "function" || typeof channel.addEventListener !== "function") {
    throw Error("data_channel_required");
  }
  if (!DEVICE.test(deviceId || "") || !Number.isInteger(responseTimeoutMs) || responseTimeoutMs < 1_000 || responseTimeoutMs > 70_000) {
    throw Error("invalid_client_configuration");
  }
  const pending = new Map();
  let closed = false;
  function onMessage(event) {
    if (typeof event?.data !== "string" || event.data.length > MAX_MESSAGE_BYTES) return;
    let response;
    try { response = JSON.parse(event.data); } catch { return; }
    if (response?.schema !== RESPONSE_SCHEMA || typeof response.requestId !== "string" ||
        !["succeeded", "rejected"].includes(response.status)) return;
    const entry = pending.get(response.requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(response.requestId);
    entry.resolve(response);
  }
  channel.addEventListener("message", onMessage);
  return Object.freeze({
    request({ capability, input = {}, ttlMs = 30_000 } = {}) {
      if (closed || channel.readyState !== "open") return Promise.reject(Error("channel_not_open"));
      const issuedAt = now();
      const request = createExecutionRequest({
        requestId: randomId("req_"), nonce: randomId("nonce_"), deviceId,
        capability, input, issuedAt, ttlMs
      });
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(request.requestId);
          reject(Error("execution_response_timeout"));
        }, responseTimeoutMs);
        pending.set(request.requestId, { resolve, reject, timer });
        try { channel.send(JSON.stringify(request)); }
        catch (error) {
          clearTimeout(timer);
          pending.delete(request.requestId);
          reject(error);
        }
      });
    },
    close() {
      closed = true;
      channel.removeEventListener?.("message", onMessage);
      for (const entry of pending.values()) {
        clearTimeout(entry.timer);
        entry.reject(Error("client_closed"));
      }
      pending.clear();
    },
    get pending() { return pending.size; }
  });
}
