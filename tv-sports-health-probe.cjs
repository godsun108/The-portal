'use strict';
const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('tv-sports-iphone-field-report.json','utf8'));
if(!Array.isArray(data.items))throw Error('Invalid field report');
async function check(item){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),6000);
 try {
  const response=await fetch(item.url,{signal:controller.signal,redirect:'follow'});
  const reader=response.body?.getReader();
  let text='';
  if(reader){try{const part=await reader.read();text=new TextDecoder().decode(part.value?.slice(0,4096)||new Uint8Array())}finally{await reader.cancel().catch(()=>{})}}
  return {name:item.name,status:response.status,manifestSeen:response.ok&&text.includes('#EXTM3U'),priorDeviceReport:item.playbackStatus,rightsStatus:'unverified',admitted:false};
 }catch(e){return {name:item.name,manifestSeen:false,error:e.name==='AbortError'?'timeout':String(e.message||e),priorDeviceReport:item.playbackStatus,rightsStatus:'unverified',admitted:false}}
 finally{clearTimeout(timeout)}
}
(async()=>{
 const items=[];
 for(let i=0;i<data.items.length;i+=4)items.push(...await Promise.all(data.items.slice(i,i+4).map(check)));
 const report={schema:'portal.tv.health.v1',checkedAt:new Date().toISOString(),disclaimer:'HTTP manifest checks only. No iPhone playback or rights verification.',counts:{tested:items.length,manifestSeen:items.filter(x=>x.manifestSeen).length},items};
 fs.writeFileSync('tv-sports-health.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report.counts));
})().catch(e=>{console.error(e);process.exitCode=1});
