import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync('tv-open-library.json','utf8'));
const evidence=JSON.parse(readFileSync('tv-cinema-device-evidence.json','utf8'));
const html=readFileSync('tv-cinema.html','utf8');
assert.equal(data.schema,'portal.tv.open-library.v1');
assert(Array.isArray(data.programs)&&data.programs.length>0);
const ids=new Set();
for(const p of data.programs){
 assert.equal(p.rightsStatus,'verified_open',p.title);
 assert.equal(p.type,'youtube_embed',p.title);
 assert.match(p.videoId,/^[A-Za-z0-9_-]{11}$/,p.title);
 assert(!ids.has(p.videoId),'Duplicate videoId '+p.videoId);ids.add(p.videoId);
 assert(p.rightsSource&&/^https:\/\//.test(p.rightsSource),'Missing rights source: '+p.title);
 assert(p.attribution&&p.license,'Missing license / attribution: '+p.title);
}
assert(Array.isArray(evidence.records));
for(const e of evidence.records){
 assert(ids.has(e.videoId),'Device evidence not found in catalog: '+e.videoId);
 assert(['user_confirmed_playing','user_reported_unavailable'].includes(e.result));
}
for(const marker of ['id="cinemaTheater"','id="cinemaScreen"','id="portalPlayableFilms"','youtube-nocookie.com/embed/','rightsStatus===\'verified_open\'','screen.replaceChildren()','cinemaReportFailed','cinemaOfficialLink']){
 assert(html.includes(marker),'Cinema player contract missing: '+marker);
}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
for(const [i,script] of scripts.entries()){try{new Function(script)}catch(e){throw new Error('Inline script '+i+': '+e.message)}}
console.log('PASS: '+data.programs.length+' admitted programs; '+evidence.records.length+' observations; '+scripts.length+' inline scripts parsed. No remote embed playback checked.');
