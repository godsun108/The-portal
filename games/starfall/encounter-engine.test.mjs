import test from 'node:test';
import assert from 'node:assert/strict';
import { enemyDrift, guardianPhase, guardianVolley } from './encounter-engine.mjs';

test('enemy movement is deterministic, bounded, and type-specific', () => {
  assert.equal(enemyDrift('sentinel', 2, 1), 0);
  assert.equal(enemyDrift('comet', 2, 1), enemyDrift('comet', 2, 1));
  assert.ok(Math.abs(enemyDrift('comet', 2, 1)) <= 76);
  assert.ok(Math.abs(enemyDrift('wraith', 2, 1)) <= 48);
  assert.equal(enemyDrift('wraith', Infinity, 1), 0);
});

test('Guardian phases advance as health falls', () => {
  assert.equal(guardianPhase(65), 1);
  assert.equal(guardianPhase(43), 1);
  assert.equal(guardianPhase(40), 2);
  assert.equal(guardianPhase(21), 2);
  assert.equal(guardianPhase(20), 3);
  assert.equal(guardianPhase(0), 3);
});

test('Guardian volleys become denser and faster in later phases', () => {
  const args = { originX: 300, originY: 100, targetX: 280, targetY: 580 };
  const first = guardianVolley({ ...args, phase: 1 });
  const second = guardianVolley({ ...args, phase: 2 });
  const final = guardianVolley({ ...args, phase: 3 });
  assert.equal(first.length, 5);
  assert.equal(second.length, 5);
  assert.equal(final.length, 7);
  assert.ok(Math.hypot(final[0].vx, final[0].vy) > Math.hypot(first[0].vx, first[0].vy));
  assert.ok(final.every(b => Number.isFinite(b.vx) && Number.isFinite(b.vy)));
});
