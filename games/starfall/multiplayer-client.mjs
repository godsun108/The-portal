import { createStarfallAction, validateStarfallAction } from "./multiplayer-actions.mjs";

/**
 * Experimental adapter for the existing Shared Reality WebSocket relay.
 * Relay messages are transport only; they do not authenticate players or
 * establish authoritative match outcomes.
 */
export function connectStarfallMultiplayer({ socket, matchId, playerId, onAction = () => {}, onStatus = () => {} } = {}) {
  if (!socket || typeof socket.send !== "function" || typeof socket.addEventListener !== "function") {
    throw new TypeError("websocket_required");
  }
  const makeAction = createStarfallAction({ playerId, matchId });
  const seen = new Map();
  let closed = false;
  const send = (type, payload) => {
    if (closed || socket.readyState !== 1) return { ok: false, reason: "not_connected" };
    const result = makeAction(type, payload);
    if (!result.ok) return result;
    const message = {
      schema: "portal.spatial.message.v1",
      sessionId: matchId,
      deviceId: playerId,
      type: "game-action",
      payload: result.event,
      at: Date.now()
    };
    socket.send(JSON.stringify(message));
    return { ok: true, event: result.event };
  };
  const receive = (event) => {
    let message;
    try { message = JSON.parse(typeof event.data === "string" ? event.data : String(event.data)); }
    catch { return; }
    if (message?.schema !== "portal.spatial.message.v1" || message.sessionId !== matchId ||
        message.type !== "game-action" || message.deviceId === playerId ||
        message.payload?.playerId !== message.deviceId ||
        !validateStarfallAction(message.payload, { matchId })) return;
    const action = message.payload;
    const last = seen.get(action.playerId) || 0;
    if (action.sequence <= last) return;
    seen.set(action.playerId, action.sequence);
    onAction(action);
  };
  const opened = () => onStatus("connected");
  const ended = () => onStatus("disconnected");
  socket.addEventListener("message", receive);
  socket.addEventListener("open", opened);
  socket.addEventListener("close", ended);
  if (socket.readyState === 1) onStatus("connected");
  return {
    send,
    close() {
      if (closed) return;
      closed = true;
      socket.removeEventListener?.("message", receive);
      socket.removeEventListener?.("open", opened);
      socket.removeEventListener?.("close", ended);
    }
  };
}
