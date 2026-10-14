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

const goals=JSON.parse(readFileSync('tv-cinema-genre-goals.json','utf8'));
assert.equal(goals.schema,'portal.tv.genre-goals.v1');
assert.equal(goals.targetPerGenre,100);
assert(goals.genreNames.length>=20&&goals.genreNames.length===new Set(goals.genreNames).size,'Genre target taxonomy must be comprehensive and unique');
for(const genre of goals.genreNames)assert(goals.discoveryQueries[genre],'Discovery query missing for '+genre);
for(const token of ['id="cinemaGenreGoals"','id="cinemaGenreGoalRows"','tv-cinema-genre-goals.json','goals.targetPerGenre','genre targets'])assert(html.includes(token),'Genre target UI missing '+token);
const classics=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
assert.equal(classics.schema,'portal.tv.classics.v1');
assert(Number.isSafeInteger(classics.catalogRevision)&&classics.catalogRevision>=1,'Classics catalog revision required');
assert.equal(classics.catalogPublishedCount,classics.titles.length,'Published count must match Classics titles');
for(const token of ['raw.githubusercontent.com/godsun108/The-portal/main/tv-cinema-classics.json','catalog='+"'"+'','Updated catalog loaded from GitHub while Pages catches up'])assert(html.includes(token),'Missing catalog freshness mechanism '+token);
assert(Array.isArray(classics.titles)&&classics.titles.length>0);
const filmIds=new Set(),filmFiles=new Set(),filmIdentity=new Set();
for(const p of classics.titles){
 assert(p.id&&!filmIds.has(p.id),'Duplicate or missing classic film ID '+p.id);filmIds.add(p.id);
 assert(p.mediaFile&&!filmFiles.has(p.mediaFile),'Duplicate or missing classic media file '+p.mediaFile);filmFiles.add(p.mediaFile);
 const identity=p.title.toLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g,'')+'-'+p.year;
 assert(!filmIdentity.has(identity),'Possible duplicate film identity '+p.title+' '+p.year);filmIdentity.add(identity);
 assert.equal(p.rightsStatus,'public_domain_us_source_documented',p.title);
 assert.match(p.mediaUrl,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
 assert.match(p.sourcePage,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert(['untested_iphone','user_confirmed_iphone_playing'].includes(p.playbackStatus),p.title);
}
assert(html.includes('id="classicsTitles"'),'Classic title view missing');
for(const marker of ['id="classicSearch"','id="classicGenre"','id="classicSort"','function renderClassics()','renderClassics();'])assert(html.includes(marker),'Classic discovery control missing: '+marker);
for(const token of ['id="classicQuality"','prop:\'videoinfo\'','viprop:\'derivatives\'','variant?.src||p.mediaUrl','session++','https://commons.wikimedia.org/w/api.php'])assert(html.includes(token),'Missing mobile Commons fallback contract: '+token);
for(const token of ['video.controls=true','x-webkit-airplay','probe.canPlayType','AirPlay icon on the video','id="classicQuality"'])assert(html.includes(token),'Native video controls missing: '+token);
for(const retired of ['id="classicAirPlay"','id="classicMirror"','id="classicTvHelpToggle"','id="classicTvHelp"','id="classicMirrorHelp"','value="tv"'])assert(!html.includes(retired),'Retired extra AirPlay interface remains: '+retired);
for(const token of ['cinema-airplay-icon','AirPlay this film','video.webkitShowPlaybackTargetPicker','screen.append(airplay)','position:absolute;top:8px;right:8px'])assert(html.includes(token),'Missing visible in-player AirPlay: '+token);
for(const retired of ['id="classicAirPlay"','id="classicMirror"','id="classicTvHelpToggle"'])assert(!html.includes(retired),'Unexpected duplicate TV button: '+retired);
console.log('PASS: '+classics.titles.length+' Classics entries and unique source files.');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
for(const [i,script] of scripts.entries()){try{new Function(script)}catch(e){throw new Error('Inline script '+i+': '+e.message)}}
console.log('PASS: '+data.programs.length+' admitted programs; '+evidence.records.length+' observations; '+scripts.length+' inline scripts parsed. No remote embed playback checked.');
