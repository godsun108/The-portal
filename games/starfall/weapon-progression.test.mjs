import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, weaponAt, firePattern } from './weapon-engine.mjs';
import { sectorAt, sectorProfile, createSectorWave } from './progression-engine.mjs';

test('weapon cycle is bounded and wraps for negative or large indices', () => {
  assert.equal(weaponAt(0).id, 'pulse');
  assert.equal(weaponAt(1).id, 'spread');
  assert.equal(weaponAt(2).id, 'twin');
  assert.equal(weaponAt(3).id, 'pulse');
  assert.equal(weaponAt(-1).id, 'twin');
});

test('weapon patterns trade coverage for cadence without invalid projectiles', () => {
  assert.equal(firePattern(0, 300, 500).length, 1);
  assert.equal(firePattern(1, 300, 500).length, 3);
  assert.equal(firePattern(2, 300, 500).length, 2);
  for (const projectile of firePattern(1, 300, 500)) {
    assert.ok(Number.isFinite(projectile.vx));
    assert.ok(Number.isFinite(projectile.vy));
    assert.equal(projectile.spent, false);
  }
  assert.ok(WEAPONS.every(w => w.cooldown > 0 && w.speed > 0));
});

test('sector timing advances through three distinct profiles', () => {
  assert.equal(sectorAt(0), 1);
  assert.equal(sectorAt(11.99), 1);
  assert.equal(sectorAt(12), 2);
  assert.equal(sectorAt(24), 3);
  assert.equal(sectorAt(80), 3);
  assert.ok(sectorProfile(1).interval > sectorProfile(3).interval);
});

test('sector waves are deterministic, increasingly dense, and bounded', () => {
  const one = createSectorWave(1, 0);
  const two = createSectorWave(2, 0);
  const three = createSectorWave(3, 0);
  assert.equal(one.length, 3);
  assert.equal(two.length, 4);
  assert.equal(three.length, 5);
  assert.ok(three.every(enemy => enemy.x >= 0 && enemy.x <= 600 && enemy.speed > 0));
  assert.deepEqual(createSectorWave(3, 2), createSectorWave(3, 2));
});
