/**
 * Starfall multiplayer adapter boundary.
 * This module deliberately contains no networking or reward authority yet.
 * It translates game actions into a versioned event shape for a future
 * authenticated multiplayer transport.
 */
const ACTIONS = new Set(["move", "fire", "pause", "resume", "sector-complete"]);

export function createStarfallAction({ playerId, matchId, sequence = 0 } = {}) {
  if (typeof playerId !== "string" || !playerId || typeof matchId !== "string" || !matchId) {
    throw new TypeError("player_and_match_required");
  }
  let next = Number.isSafeInteger(sequence) && sequence >= 0 ? sequence : 0;
  return function makeAction(type, payload = {}) {
    if (!ACTIONS.has(type)) return { ok: false, reason: "unsupported_action" };
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { ok: false, reason: "invalid_payload" };
    }
    const event = {
      schema: "earthchain.starfall.action.v1",
      matchId,
      playerId,
      sequence: ++next,
      type,
      payload
    };
    if (new TextEncoder().encode(JSON.stringify(event)).length > 2048) {
      next--;
      return { ok: false, reason: "payload_too_large" };
    }
    return { ok: true, event };
  };
}

export function validateStarfallAction(event, { matchId, maxSequence = Number.MAX_SAFE_INTEGER } = {}) {
  if (!event || event.schema !== "earthchain.starfall.action.v1") return false;
  if (event.matchId !== matchId || typeof event.playerId !== "string" || !event.playerId) return false;
  if (!ACTIONS.has(event.type) || !Number.isSafeInteger(event.sequence) || event.sequence < 1 || event.sequence > maxSequence) return false;
  return Boolean(event.payload && typeof event.payload === "object" && !Array.isArray(event.payload));
}
