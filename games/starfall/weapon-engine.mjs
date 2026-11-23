// Player weapon patterns. Damage is deliberately equal per projectile; trade-offs are coverage vs precision.
export const WEAPONS = Object.freeze([
  Object.freeze({ id: 'pulse', label: 'Pulse', cooldown: 0.16, speed: 490, offsets: [0] }),
  Object.freeze({ id: 'spread', label: 'Spread', cooldown: 0.29, speed: 455, offsets: [-0.16, 0, 0.16] }),
  Object.freeze({ id: 'twin', label: 'Twin Lance', cooldown: 0.22, speed: 535, offsets: [-0.045, 0.045] })
]);

export function weaponAt(index) {
  const safe = Number.isFinite(index) ? Math.trunc(index) : 0;
  return WEAPONS[((safe % WEAPONS.length) + WEAPONS.length) % WEAPONS.length];
}

export function firePattern(index, x, y) {
  const weapon = weaponAt(index);
  return weapon.offsets.map(angle => ({
    x, y, vx: Math.sin(angle) * weapon.speed,
    vy: -Math.cos(angle) * weapon.speed, spent: false
  }));
}
