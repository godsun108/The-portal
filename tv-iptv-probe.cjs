// Bounded availability probe for unadmitted IPTV candidates. No auto-publication.
const fs=require('node:fs');
const catalog=JSON.parse(fs.readFileSync('tv-iptv-discovery.json','utf8'));
if(catalog.schema!=='portal.tv.iptv-discovery.v1'||!Array.isArray(catalog.items))throw Error('Unexpected catalog');
// Reserve capacity for both priorities: a sports-heavy catalog must not starve finance.
const pool=catalog.items.filter(x=>x.admitted===false);
const sports=pool.filter(x=>x.categories.includes('sports')).slice(0,25);
const selected=new Set(sports.map(x=>x.id));
const finance=pool.filter(x=>x.categories.includes('business')&&!selected.has(x.id)).slice(0,25);
finance.forEach(x=>selected.add(x.id));
const other=pool.filter(x=>!selected.has(x.id)).slice(0,60-sports.length-finance.length);
const candidates=[...sports,...finance,...other];
async function probe(item){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
 try{
  const res=await fetch(item.streamUrl,{signal:controller.signal,headers:{Range:'bytes=0-4095'},redirect:'follow'});
  const type=res.headers.get('content-type')||'';
  const reader=res.body?.getReader();let sample='';
  if(reader){const part=await reader.read();if(part.value)sample=new TextDecoder().decode(part.value.slice(0,4096));await reader.cancel().catch(()=>{});}
  return {id:item.id,name:item.name,categories:item.categories,httpStatus:res.status,contentType:type,manifestSeen:res.ok&&sample.includes('#EXTM3U'),rightsStatus:'unverified',iphonePlayback:'untested',admitted:false};
 }catch(e){return {id:item.id,name:item.name,categories:item.categories,error:e.name==='AbortError'?'timeout':String(e.message||e).slice(0,120),manifestSeen:false,rightsStatus:'unverified',iphonePlayback:'untested',admitted:false}}
 finally{clearTimeout(timer)}
}
(async()=>{
 const results=[];for(let i=0;i<candidates.length;i+=6)results.push(...await Promise.all(candidates.slice(i,i+6).map(probe)));
 const out={schema:'portal.tv.stream-probe.v1',generatedAt:new Date().toISOString(),note:'HTTP manifest checks only, not video playback or authorization; none admitted.',counts:{tested:results.length,manifestSeen:results.filter(x=>x.manifestSeen).length,sports:results.filter(x=>x.categories.includes('sports')).length,business:results.filter(x=>x.categories.includes('business')).length,successfulSports:results.filter(x=>x.manifestSeen&&x.categories.includes('sports')).length,successfulFinance:results.filter(x=>x.manifestSeen&&x.categories.includes('business')).length},items:results};
 fs.writeFileSync('tv-iptv-probe.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify(out.counts));
})().catch(e=>{console.error(e);process.exitCode=1});
