// Candidate discovery only. A public directory listing is not playback or rights clearance.
import {writeFileSync} from 'node:fs';
const base='https://iptv-org.github.io/api/';
async function get(name){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);try{const response=await fetch(base+name,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error(name+' HTTP '+response.status);return await response.json()}finally{clearTimeout(timeout)}}
const [channels,streams,blocklist]=await Promise.all(['channels.json','streams.json','blocklist.json'].map(get));
const blocked=new Set(blocklist.map(x=>x.channel));
const stations=new Map(channels.filter(x=>x.id&&!x.closed&&!x.is_nsfw&&!blocked.has(x.id)).map(x=>[x.id,x]));
const byCountry={},byCategory={},byLanguage={};const seen=new Set();let candidateFeeds=0,skipped=0;
function count(map,key){map[key]=(map[key]||0)+1}
for(const s of streams){const c=stations.get(s.channel);if(!c||s.referrer||s.user_agent){skipped++;continue}let u;try{u=new URL(s.url)}catch{skipped++;continue}if(u.protocol!=='https:'||!u.pathname.toLowerCase().endsWith('.m3u8')||u.username||u.password||seen.has(s.url)){skipped++;continue}seen.add(s.url);candidateFeeds++;count(byCountry,c.country||'Unknown');for(const k of c.categories||[])count(byCategory,k);for(const k of c.languages||[])count(byLanguage,k)}
const sortCounts=x=>Object.fromEntries(Object.entries(x).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])));
const report={schema:'portal.tv.world-directory-audit.v1',generatedAt:new Date().toISOString(),source:base,disclaimer:'Directory candidates only. No automated admission, playback verification, or rights clearance.',totals:{directoryChannels:channels.length,directoryStreams:streams.length,candidateFeeds,skipped},byCountry:sortCounts(byCountry),byCategory:sortCounts(byCategory),byLanguage:sortCounts(byLanguage)};
writeFileSync('world-tv-directory-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('World TV candidates:',candidateFeeds,'across',Object.keys(byCountry).length,'countries and',Object.keys(byCategory).length,'categories');
if(!candidateFeeds||!Object.keys(byCountry).length)process.exitCode=1;
