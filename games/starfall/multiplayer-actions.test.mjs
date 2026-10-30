import test from "node:test";
import assert from "node:assert/strict";
import { createStarfallAction, validateStarfallAction } from "./multiplayer-actions.mjs";

test("Starfall actions receive ordered versioned envelopes", () => {
  const make = createStarfallAction({ playerId: "phone-a", matchId: "room-123" });
  const first = make("move", { x: 0.5, y: 0.2 });
  const second = make("fire", { weapon: "pulse" });
  assert.equal(first.ok, true);
  assert.equal(first.event.sequence, 1);
  assert.equal(second.event.sequence, 2);
  assert.equal(validateStarfallAction(first.event, { matchId: "room-123" }), true);
});

test("Starfall action boundary rejects unknown, wrong-room and oversized events", () => {
  const make = createStarfallAction({ playerId: "phone-a", matchId: "room-123" });
  assert.equal(make("grant-coins", { amount: 999 }).ok, false);
  assert.equal(make("move", { data: "x".repeat(3000) }).reason, "payload_too_large");
  const event = make("move", { x: 1 }).event;
  assert.equal(validateStarfallAction(event, { matchId: "other-room" }), false);
  assert.equal(validateStarfallAction({ ...event, sequence: 0 }, { matchId: "room-123" }), false);
});

test("Starfall action factory requires match and player identifiers", () => {
  assert.throws(() => createStarfallAction({ matchId: "room" }), /player_and_match_required/);
});
