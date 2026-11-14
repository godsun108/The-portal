// Starfall encounter logic: deterministic, bounded helpers for enemy motion and Guardian volleys.
export function enemyDrift(kind, elapsed, seed = 0) {
  if (!Number.isFinite(elapsed) || !Number.isFinite(seed)) return 0;
  if (kind === 'comet') return Math.sin(elapsed * 2.1 + seed) * 76;
  if (kind === 'wraith') return Math.sin(elapsed * 3.4 + seed) * 48;
  return 0;
}

export function guardianPhase(hp, maxHp = 65) {
  if (!Number.isFinite(hp) || !Number.isFinite(maxHp) || maxHp <= 0) return 1;
  const ratio = Math.max(0, Math.min(1, hp / maxHp));
  return ratio > 2 / 3 ? 1 : ratio > 1 / 3 ? 2 : 3;
}

export function guardianVolley({ phase = 1, originX, originY, targetX, targetY, sequence = 0 }) {
  const count = phase >= 3 ? 7 : 5;
  const spread = phase >= 3 ? 0.68 : phase === 2 ? 0.5 : 0.34;
  const speed = phase >= 3 ? 255 : phase === 2 ? 235 : 220;
  const base = Math.atan2(targetY - originY, targetX - originX);
  const offset = (sequence % 2 ? 0.035 : -0.035);
  return Array.from({ length: count }, (_, index) => {
    const angle = base + offset + (index - (count - 1) / 2) * spread / (count - 1);
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  });
}
