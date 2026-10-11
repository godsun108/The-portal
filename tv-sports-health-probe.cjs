// HTTP-only health sampling of user-reported streams. No playback or rights certification.
'use strict';
const fs=require('node:fs');
const report=JSON.parse(fs.readFileSync('tv-sports-iphone-field-report.json','utf8'));
if(report.schema!=='portal.tv.user-field-reports.v1'||!Array.isArray(report.items))throw Error('Unexpected field report');
const timeoutMs=7000;
async function check(item){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const r=await fetch(item.url,{signal:controller.signal,redirect:'follow',headers:{Range:'bytes=0-8191'}});
  let sample='';
  if(r.body){const reader=r.body.getReader();try{const chunk=await reader.read();if(chunk.value)sample=new TextDecoder().decode(chunk.value.slice(0,8192))}finally{await reader.cancel().catch(()=>{})}}
  return {name:item.name,url:item.url,previousUserReport:item.playbackStatus,httpStatus:r.status,manifestSeen:r.ok&&sample.includes('#EXTM3U'),contentType:r.headers.get('content-type')||'',rightsStatus:'unverified',admitted:false};
 }catch(e){return {name:item.name,url:item.url,previousUserReport:item.playbackStatus,manifestSeen:false,error:e.name==='AbortError'?'timeout':String(e.message||e).slice(0,160),rightsStatus:'unverified',admitted:false}}
 finally{clearTimeout(timer)}
}
(async()=>{
 const items=[];for(let i=0;i<report.items.length;i+=4)items.push(...await Promise.all(report.items.slice(i,i+4).map(check)));
 const out={schema:'portal.tv.field-health.v1',generatedAt:new Date().toISOString(),note:'Remote HTTP manifest sample only; may differ from iPhone playback. No rights or licensing check. No auto-admission.',counts:{tested:items.length,manifestSeen:items.filter(x=>x.manifestSeen).length,notSeen:items.filter(x=>!x.manifestSeen).length},items};
 fs.writeFileSync('tv-sports-health-latest.json',JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify(out.counts));
})().catch(e=>{console.error(e);process.exitCode=1});
