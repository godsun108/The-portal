#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const html=fs.readFileSync('music-foundry/preview-player.html','utf8');
const checks=[
 ['public release audio source is configured',/github\.com\/godsun108\/turbo-foundry\/releases\/download\/music-preview-latest/.test(html)],
 ['mix and four stems are mapped',/instrumental_mix\.wav/.test(html)&&/lead\.wav/.test(html)&&/chords\.wav/.test(html)&&/bass\.wav/.test(html)&&/drums\.wav/.test(html)],
 ['mix and stems modes exist',/id="mixMode"/.test(html)&&/id="stemsMode"/.test(html)],
 ['native streaming audio is used',/new Audio\(\)/.test(html)&&/audio\.play\(\)/.test(html)],
 ['synchronized transport and seek exist',/Promise\.all\(tracks\.map\(t=>t\.audio\.play\(\)\)\)/.test(html)&&/t\.audio\.currentTime=offset/.test(html)],
 ['mute, solo, and level controls exist',/t\.audio\.muted/.test(html)&&/t\.solo/.test(html)&&/t\.audio\.volume/.test(html)],
 ['manual file picker and decoding are absent',!(/type="file"|decodeAudioData|arrayBuffer\(\)/.test(html))]
];
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
if(scripts.length!==1)checks.push(['one inline script',false]);
else{const result=spawnSync(process.execPath,['--check'],{input:scripts[0],encoding:'utf8'});checks.push(['inline JavaScript syntax',result.status===0]);if(result.status!==0)process.stderr.write(result.stderr||result.stdout);}
for(const [label,ok] of checks)console.log((ok?'PASS ':'FAIL ')+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
