// Bounded candidate-to-review-queue bridge. This file is never an authorization.
import {readFileSync,writeFileSync} from 'node:fs';
const raw=JSON.parse(readFileSync('cinema-discovery-candidates.json','utf8'));
if(raw.schema!=='portal.cinema.discovery-candidates.v1'||!Array.isArray(raw.candidates))throw Error('Invalid discovery input');
const approvals=JSON.parse(readFileSync('cinema-publication-approvals.json','utf8'));
if(approvals.schema!=='portal.cinema.publication-approvals.v1'||!Array.isArray(approvals.entries))throw Error('Invalid approvals manifest');
const approved=new Set(approvals.entries.map(x=>String(x.mediaFile||'').replaceAll('_',' ').toLowerCase()));
const queue=[],seen=new Set();
for(const x of raw.candidates.slice(0,120)){
 const file=String(x.title||'').replace(/^File:/,'').trim(),key=file.replaceAll('_',' ').toLowerCase();
 if(!file||seen.has(key)||approved.has(key)||!/^video\//.test(String(x.mime||'')))continue;
 seen.add(key);
 const format=/\.webm$/i.test(file)?'webm':'unsupported_for_current_player';
 queue.push({mediaFile:file,sourcePage:x.sourcePage||null,format,bytes:x.bytes||null,licenseHint:x.licenseHint||'unknown',priority:format==='webm'?'needs_rights_and_playback_review':'needs_transcode_or_player_support',rightsStatus:'unverified',playbackStatus:'untested',qualityStatus:'unreviewed',publicationApproved:false,requiredEvidence:['specific_file_rights_and_territory','edition_and_soundtrack_review','playback_on_supported_devices','title_year_genre_runtime_credits','curation_quality_review']});
}
const rank={webm:0,unsupported_for_current_player:1};
queue.sort((a,b)=>(rank[a.format]??2)-(rank[b.format]??2)||a.mediaFile.localeCompare(b.mediaFile));
const webmReadyForReview=queue.filter(x=>x.format==='webm');
writeFileSync('cinema-review-queue.json',JSON.stringify({schema:'portal.cinema.review-queue.v1',generatedAt:new Date().toISOString(),count:queue.length,webmReviewCount:webmReadyForReview.length,priorityReview:webmReadyForReview.slice(0,25),disclaimer:'Research-only queue. No candidate is authorized for publication.',candidates:queue},null,2)+'\n');
console.log('Cinema review queue:',queue.length,'candidates; webm:',queue.filter(x=>x.format==='webm').length);
