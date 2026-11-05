#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const file = 'music-foundry/preview-player.html';
const html = fs.readFileSync(file, 'utf8');
const checks = [
  ['file input exists', /<input[^>]+type="file"[^>]+id="audioFile"/i.test(html)],
  ['native audio controls exist', /<audio[^>]+id="player"[^>]+controls/i.test(html)],
  ['live status region exists', /role="status"[^>]*aria-live="polite"/i.test(html)],
  ['local object URL is created', /URL\.createObjectURL\(file\)/.test(html)],
  ['object URL is released', /URL\.revokeObjectURL\(objectUrl\)/.test(html)],
  ['page-exit cleanup exists', /addEventListener\('pagehide',\s*release\)/.test(html)],
  ['no network upload APIs are present', !/\b(fetch\s*\(|XMLHttpRequest|WebSocket)\b/.test(html)]
];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (scripts.length !== 1) checks.push(['exactly one inline script', false]);
else {
  const syntax = spawnSync(process.execPath, ['--check'], { input: scripts[0], encoding: 'utf8' });
  checks.push(['inline JavaScript syntax', syntax.status === 0]);
  if (syntax.status !== 0) process.stderr.write(syntax.stderr || syntax.stdout);
}
for (const [label, ok] of checks) console.log((ok ? 'PASS ' : 'FAIL ') + label);
if (checks.some(([, ok]) => !ok)) process.exit(1);
