// PORTAL TV Signal Producer — checks known streams; never claims browser playback verification.
import fs from 'node:fs/promises';
const catalog=JSON.parse(await fs.readFile('tv-programs.json','utf8'));
const results=[];
for(const p of catalog.programs.filter(p=>p.type==='hls'&&p.live)){
 const start=Date.now();let state='unreachable',http=null,detail='';
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
  try{
   const res=await fetch(p.url,{signal:controller.signal,headers:{'Accept':'application/vnd.apple.mpegurl,application/x-mpegURL,*/*'}});
   http=res.status;
   const body=(await res.text()).slice(0,8192);
   state=res.ok&&body.includes('#EXTM3U')?'manifest_reachable':'manifest_unconfirmed';
   detail=res.ok?'HTTP response received':'HTTP '+res.status;
  }finally{clearTimeout(timer)}
 }catch(e){detail=String(e.message||e).slice(0,180)}
 results.push({title:p.title,url:p.url,manifestStatus:state,http,latencyMs:Date.now()-start,deviceConfirmed:!!p.deviceConfirmed,detail});
}
const report={schemaVersion:1,generatedAt:new Date().toISOString(),note:'Server-side manifest reachability is NOT proof of playback, authorization, geography or device compatibility.',channels:results};
await fs.writeFile('tv-signal-health.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
