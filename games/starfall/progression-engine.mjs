// Three-sector encounter pacing and authored enemy formations.
const PROFILES = Object.freeze([
  null,
  Object.freeze({ interval: 3.5, count: 3, speed: 1, kinds: ['sentinel', 'sentinel', 'comet'], formation: 'line' }),
  Object.freeze({ interval: 3.15, count: 4, speed: 1.12, kinds: ['comet', 'wraith', 'comet', 'wraith'], formation: 'sweep' }),
  Object.freeze({ interval: 2.85, count: 5, speed: 1.24, kinds: ['wraith', 'comet', 'wraith', 'comet', 'wraith'], formation: 'fan' })
]);

export function sectorAt(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) return 1;
  return Math.min(3, 1 + Math.floor(elapsed / 12));
}

export function sectorProfile(sector) {
  return PROFILES[Math.max(1, Math.min(3, Math.trunc(sector) || 1))];
}

export function createSectorWave(sector, waveIndex = 0) {
  const safeSector = Math.max(1, Math.min(3, Math.trunc(sector) || 1));
  const profile = sectorProfile(safeSector);
  const count = profile.count + (waveIndex % 3 === 2 && safeSector > 1 ? 1 : 0);
  const spacing = 440 / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) => {
    let lane = 80 + spacing * i;
    if (profile.formation === 'sweep' && waveIndex % 2) lane = 520 - spacing * i;
    if (profile.formation === 'fan') lane = 300 + (i - (count - 1) / 2) * 92;
    return {
      x: lane,
      kind: profile.kinds[(i + waveIndex) % profile.kinds.length],
      speed: profile.speed * (1 + Math.min(0.18, waveIndex * 0.015)),
      delay: i * 0.16
    };
  });
}
