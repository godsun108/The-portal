import {readFileSync,writeFileSync} from 'node:fs';
const current=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const known=new Set(current.titles.map(x=>x.mediaFile.toLowerCase()));
const searches=['"feature film" webm','"silent film" webm','"documentary" webm','"full movie" webm'];
const dailySearch=searches[Math.floor(Date.now()/86400000)%searches.length];
const candidates=new Map();
async function request(params){const url=new URL('https://commons.wikimedia.org/w/api.php');for(const [k,v] of Object.entries({action:'query',format:'json',...params}))url.searchParams.set(k,String(v));const ctrl=new AbortController();const tm=setTimeout(()=>ctrl.abort(),12000);try{const r=await fetch(url,{headers:{'User-Agent':'PortalCinemaDiscovery/1.0 (rights review queue; no auto publishing)','Accept':'application/json'},signal:ctrl.signal});if(!r.ok)throw Error('Commons HTTP '+r.status);return await r.json()}finally{clearTimeout(tm)}}
const errors=[];
for(const term of [dailySearch]){try{const data=await request({generator:'search',gsrsearch:term,gsrnamespace:'6',gsrlimit:'25',prop:'imageinfo',iiprop:'mime|size|extmetadata'});for(const p of Object.values(data.query?.pages||{})){const f=p.title?.replace(/^File:/,'');if(!f||known.has(f.toLowerCase())||candidates.has(f.toLowerCase()))continue;const info=p.imageinfo?.[0];if(!info||!String(info.mime).startsWith('video/')||info.size<10000000)continue;const license=String(info.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]+>/g,'').slice(0,100);const item={file:f,sourcePage:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title).replace(/%20/g,'_').replace(/%3A/i,':'),mime:info.mime,bytes:info.size,licenseHint:license,reviewStatus:'unreviewed',requiredChecks:['full film vs trailer or clip','film length and quality','US and relevant territorial rights','license applicability to specific edition, audio and restoration','on-device playback, captions and file size']};candidates.set(f.toLowerCase(),item)}}catch(e){errors.push({query:term,error:String(e.message||e).slice(0,140)})}}
function score(x){
 const name=x.file.toLowerCase();
 let n=0;
 if(/\\b(18\\d{2}|19\\d{2})\\b/.test(name))n+=12;
 if(/film|movie|feature|complete|full|silent|documentary/.test(name))n+=12;
 if(/webm|mp4/.test(name))n+=8;
 if(/trailer|excerpt|clip|sample|teaser|test|advert|commercial|promo/.test(name))n-=35;
 if(x.bytes>=50e6&&x.bytes<=1.2e9)n+=12;
 else if(x.bytes>2e9)n-=15;
 if(/public domain|\\bpd\\b|cc0/i.test(x.licenseHint))n+=6;
 return n;
}
const results=[...candidates.values()].map(x=>({...x,triageScore:score(x),reviewStatus:'unreviewed',scoreDisclaimer:'Heuristic prioritization only; not rights proof or full-feature validation.'})).sort((a,b)=>b.triageScore-a.triageScore||a.bytes-b.bytes).slice(0,60);
const report={schema:'portal.tv.discovery.queue.v1',generatedAt:new Date().toISOString(),activeSearch:dailySearch,networkStatus:errors.length?'degraded':'ok',policy:'Research candidates only. Search results and license hints are NOT proof of rights or playability; no auto-admission.',searches,existingClassics:current.titles.length,candidateCount:results.length,errors,candidates:results};
writeFileSync('cinema-discovery-queue.json',JSON.stringify(report,null,2)+'\n');
console.log('Found '+results.length+' unreviewed Commons media candidates ('+errors.length+' query errors). No catalog mutations.');
for(const item of results.slice(0,15))console.log('REVIEW-CANDIDATE score='+item.triageScore+' bytes='+item.bytes+' licenseHint='+JSON.stringify(item.licenseHint)+' title='+JSON.stringify(item.file)+' url='+item.sourcePage);
if(errors.length)console.warn('Discovery unavailable; queue is empty, not proof of no candidates. '+errors.map(x=>x.error).join('; '));
