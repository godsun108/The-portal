// Conservative automated review of sampled feeds. Never equate reachability with playback or rights.
import {readFileSync,writeFileSync} from 'node:fs';
const report=JSON.parse(readFileSync('world-tv-stream-health.json','utf8'));
if(report.schema!=='portal.tv.world-stream-health.v1'||!Array.isArray(report.results))throw Error('Unexpected health report');
const candidates=report.results.map(x=>({
 name:x.name,country:x.country,category:x.category,url:x.url,
 technicalStatus:x.status==='http_reachable'?'needs_browser_playback_test':x.status==='http_error'?'retry_or_reject':'retry_unknown',
 playbackApproved:false,publicationApproved:false,rightsStatus:'unverified',
 reason:x.status==='http_reachable'?'HTTP response is not decoded video playback':'No confirmed playable video'
}));
const rank={needs_browser_playback_test:0,retry_unknown:1,retry_or_reject:2};
candidates.sort((a,b)=>(rank[a.technicalStatus]??3)-(rank[b.technicalStatus]??3)||a.country.localeCompare(b.country)||a.name.localeCompare(b.name));
const summary={schema:'portal.tv.candidate-review.v1',generatedAt:new Date().toISOString(),sourceSchema:report.schema,reviewed:candidates.length,playbackApproved:0,publicationApproved:0,needsPlaybackTest:candidates.filter(x=>x.technicalStatus==='needs_browser_playback_test').length,priorityReview:candidates.slice(0,20),candidates};
writeFileSync('world-tv-candidate-review.json',JSON.stringify(summary,null,2)+'\n');
console.log('Queued',summary.needsPlaybackTest,'streams for device playback verification; none auto-published');
