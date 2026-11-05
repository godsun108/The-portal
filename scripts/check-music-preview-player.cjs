const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('music-foundry/preview-player.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Music Foundry player script is missing');
new vm.Script(match[1], { filename: 'music-foundry/preview-player.js' });
for (const token of [
  'createMediaElementSource', 'createGain()', 'audioContext.resume()',
  'ensureAudioGraph();', 'warehouse-rave-v2/', 'warehouseStemsMode',
  'warehouse-rave-texture-a/', 'textureStemsMode', 'BASES[mode]', 'setTargetAtTime'
]) {
  if (!match[1].includes(token)) throw new Error('Missing player invariant: ' + token);
}
if (match[1].includes('t.audio.volume')) throw new Error('Unsupported HTMLAudioElement volume control remains');
console.log('Music Foundry player syntax and Web Audio mixer invariants passed');
