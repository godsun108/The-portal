// PORTAL TV Signal Producer: manifest reachability only, not end-user playback verification.
import fs from 'node:fs/promises';
const catalog=JSON.parse(await fs.readFile('tv-programs.json','utf8'));
const feeds=catalog.programs.filter(p=>p.type==='hls'&&p.live&&/^https:\/\//.test(p.url));
async function inspect(p){
 const start=Date.now();let state='unreachable',http=null,detail='';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
 try{
  const res=await fetch(p.url,{signal:controller.signal,headers:{Accept:'application/vnd.apple.mpegurl,application/x-mpegURL,*/*'}});
  http=res.status;
  // Read only a bounded amount: a broadcaster could accidentally return a large non-playlist response.
  const reader=res.body?.getReader();let bytes=0,parts=[];
  if(reader){while(bytes<16384){const {done,value}=await reader.read();if(done)break;const part=value.slice(0,16384-bytes);parts.push(part);bytes+=part.length;if(bytes>=16384)break}await reader.cancel().catch(()=>{})}
  const body=new TextDecoder().decode(Buffer.concat(parts.map(x=>Buffer.from(x))));
  state=res.ok&&/^\s*#EXTM3U(?:\s|$)/.test(body)?'manifest_reachable':'manifest_unconfirmed';
  detail=res.ok?'HTTP response received':'HTTP '+res.status;
 }catch(e){detail=String(e.message||e).slice(0,180)}finally{clearTimeout(timer)}
 return {title:p.title,url:p.url,manifestStatus:state,http,latencyMs:Date.now()-start,deviceConfirmed:!!p.deviceConfirmed,detail};
}
const results=await Promise.all(feeds.map(inspect));
const report={schemaVersion:2,generatedAt:new Date().toISOString(),note:'Server-side manifest reachability is NOT proof of playback, authorization, geography or device compatibility.',summary:{checked:results.length,reachable:results.filter(x=>x.manifestStatus==='manifest_reachable').length},channels:results};
await fs.writeFile('tv-signal-health.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
