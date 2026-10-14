import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const taxonomy=JSON.parse(readFileSync('tv-cinema-genre-goals.json','utf8'));
const classics=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const open=JSON.parse(readFileSync('tv-open-library.json','utf8'));
assert.equal(taxonomy.schema,'portal.tv.genre-goals.v1');
assert.equal(taxonomy.targetPerGenre,100);
assert.equal(new Set(taxonomy.genreNames).size,taxonomy.genreNames.length);
const counts=Object.fromEntries(taxonomy.genreNames.map(x=>[x,0]));
const canonical=s=>taxonomy.genreNames.includes(s)?s:taxonomy.aliases[s]||null;
const unknown=new Set();
const entries=[];
for(const p of classics.titles){
 const tags=[...new Set(String(p.genre||'').split(' · ').map(g=>{const normalized=canonical(g.trim());if(!normalized)unknown.add(g.trim());return normalized}).filter(Boolean))];
 for(const tag of tags)counts[tag]++;
 entries.push({id:p.id,title:p.title,source:'classics',genres:tags,playbackStatus:p.playbackStatus});
}
// The Blender library says genre="Movies", not a real category.
// Do not invent genres to inflate the goal; mark these unclassified until individually reviewed.
for(const p of open.programs)entries.push({id:'blender:'+p.videoId,title:p.title,source:'open_films',genres:[],playbackStatus:'not_counted',needsGenreReview:true});
const rows=taxonomy.genreNames.map(genre=>({genre,target:taxonomy.targetPerGenre,count:counts[genre],remaining:Math.max(0,taxonomy.targetPerGenre-counts[genre]),coveragePercent:Math.min(100,counts[genre]/taxonomy.targetPerGenre*100),discoveryQuery:taxonomy.discoveryQueries[genre]})).sort((a,b)=>a.count-b.count||a.genre.localeCompare(b.genre));
const report={schema:'portal.tv.genre-coverage.v1',generatedAt:new Date().toISOString(),targetPerGenre:taxonomy.targetPerGenre,genres:rows,uniqueAdmittedEntries:entries.length,classifiedEntries:entries.filter(x=>x.genres.length).length,unclassifiedEntries:entries.filter(x=>!x.genres.length).length,unknownGenreTags:[...unknown],policy:taxonomy.countingPolicy,disclaimer:'Counts measure catalog classification, not rights clearances or tested playback. Entries may count in more than one genre.',entries};
writeFileSync('cinema-genre-coverage.json',JSON.stringify(report,null,2)+'\n');
console.log('GENRE COVERAGE: '+rows.length+' targets x '+taxonomy.targetPerGenre+' titles; catalog '+report.uniqueAdmittedEntries+' unique entries; '+report.unclassifiedEntries+' not yet classified.');
for(const x of rows)console.log(x.genre.padEnd(18)+' '+String(x.count).padStart(3)+'/100; remaining '+x.remaining);
if(unknown.size)console.log('Review unknown historical genre tags: '+[...unknown].join(', '));
