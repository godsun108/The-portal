#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const file='music-foundry/preview-player.html';
const html=fs.readFileSync(file,'utf8');
const checks=[
 ['multi-file WAV picker exists',/<input[^>]+id="files"[^>]+type="file"[^>]+multiple/i.test(html)],
 ['shared play and stop controls exist',/id="play"/.test(html)&&/id="stop"/.test(html)],
 ['shared seek control exists',/id="seek"[^>]+type="range"/.test(html)],
 ['track list and master control exist',/id="tracks"/.test(html)&&/id="master"/.test(html)],
 ['Web Audio API with Safari fallback exists',/window\.AudioContext\|\|window\.webkitAudioContext/.test(html)],
 ['synchronized shared start time exists',/const when=ctx\.currentTime\+\.06/.test(html)],
 ['per-track gain, mute, and solo exist',/gainNode/.test(html)&&/track\.muted/.test(html)&&/track\.solo/.test(html)],
 ['local file decode exists',/file\.arrayBuffer\(\)/.test(html)&&/decodeAudioData/.test(html)],
 ['file count is bounded',/MAX_FILES=5/.test(html)],
 ['no network upload APIs are present',!/\b(fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon)\b/.test(html)]
];
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
if(scripts.length!==1)checks.push(['exactly one inline script',false]);
else{const result=spawnSync(process.execPath,['--check'],{input:scripts[0],encoding:'utf8'});checks.push(['inline JavaScript syntax',result.status===0]);if(result.status!==0)process.stderr.write(result.stderr||result.stdout);}
for(const [label,ok] of checks)console.log((ok?'PASS ':'FAIL ')+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
