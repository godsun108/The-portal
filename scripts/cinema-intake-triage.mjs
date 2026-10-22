// Automated cinema intake triage; no auto-publication without independent rights and playback review.
import {readFileSync,writeFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
if(catalog.schema!=='portal.tv.classics.v1'||!Array.isArray(catalog.titles))throw Error('Unexpected cinema catalog');
const seen=new Set(),rows=catalog.titles.map(t=>{const issues=[];if(!t.id||!t.title||!t.sourcePage||!t.mediaUrl)issues.push('incomplete_metadata');if(seen.has(t.id))issues.push('duplicate_id');seen.add(t.id);if(t.rightsStatus!=='public_domain_us_source_documented')issues.push('rights_documentation_review');if(t.playbackStatus!=='user_confirmed_iphone_playing')issues.push('device_playback_review');return {id:t.id,title:t.title,year:t.year,status:issues.length?'needs_review':'catalog_entry_documented',issues}});
const report={schema:'portal.tv.cinema-intake.v1',generatedAt:new Date().toISOString(),catalogEntries:rows.length,needsReview:rows.filter(x=>x.issues.length).length,disclaimer:'Catalog documentation is not independent rights clearance. This report does not automatically publish titles or claim playback.',rows};
writeFileSync('tv-cinema-intake-report.json',JSON.stringify(report,null,2)+'\n');
console.log('Cinema intake:',rows.length,'entries;',report.needsReview,'need review');
