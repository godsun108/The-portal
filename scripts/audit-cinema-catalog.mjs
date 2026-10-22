import {readFileSync,writeFileSync} from 'node:fs';
const j=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
if(j.schema!=='portal.tv.classics.v1'||!Array.isArray(j.titles))throw Error('Unexpected cinema catalog');
const seen=new Set(),results=[];for(const t of j.titles){const problems=[];if(!t.id||!t.title||!t.mediaFile||!t.sourcePage)problems.push('missing_required_metadata');if(seen.has(t.id))problems.push('duplicate_id');seen.add(t.id);if(!String(t.sourcePage||'').startsWith('https://commons.wikimedia.org/wiki/File:'))problems.push('unrecognized_source');if(!t.rightsStatus)problems.push('rights_review_missing');results.push({id:t.id,title:t.title,year:t.year,genre:t.genre,rightsStatus:t.rightsStatus||'unverified',playbackStatus:t.playbackStatus||'unknown',issues:problems})}
const report={schema:'portal.tv.cinema-catalog-audit.v1',generatedAt:new Date().toISOString(),total:results.length,metadataIssues:results.filter(x=>x.issues.length).length,deviceConfirmed:results.filter(x=>x.playbackStatus==='user_confirmed_iphone_playing').length,disclaimer:'Metadata audit only. Source rights claims are not independent legal clearance; playback observations are not ongoing availability.',results};
writeFileSync('tv-cinema-catalog-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('Cinema entries',report.total,'metadata issues',report.metadataIssues,'device confirmed',report.deviceConfirmed);
if(report.metadataIssues)process.exitCode=1;
