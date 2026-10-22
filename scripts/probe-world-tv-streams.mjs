// Bounded candidate health sample; HTTP success is not playback or rights clearance.
import {writeFileSync} from 'node:fs';
const base='https://iptv-org.github.io/api/';
async function json(name){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),20000);try{const r=await fetch(base+name,{signal:ctl.signal});if(!r.ok)throw Error(name+' HTTP '+r.status);return r.json()}finally{clearTimeout(t)}}
const [channels,streams,blocked]=await Promise.all(['channels.json','streams.json','blocklist.json'].map(json));
const deny=new Set(blocked.map(x=>x.channel)),eligible=new Map(channels.filter(x=>x.id&&!x.closed&&!x.is_nsfw&&!deny.has(x.id)).map(x=>[x.id,x]));
// Rotate the bounded sample daily so the same first 60 streams are not tested forever.
const sample=[],seen=new Set();const day=Math.floor(Date.now()/86400000);const start=streams.length?(day*60)%streams.length:0;
for(let offset=0;offset<streams.length;offset++){const s=streams[(start+offset)%streams.length];const c=eligible.get(s.channel);if(!c||s.referrer||s.user_agent||seen.has(s.channel))continue;let u;try{u=new URL(s.url)}catch{continue}if(u.protocol!=='https:'||!u.pathname.toLowerCase().endsWith('.m3u8')||u.username||u.password)continue;seen.add(s.channel);sample.push({name:c.name,country:c.country||'Unknown',category:c.categories?.[0]||'Other',url:s.url});if(sample.length>=60)break}
async function probe(item){const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),7000);try{const r=await fetch(item.url,{method:'GET',headers:{Range:'bytes=0-1023'},signal:ctl.signal,redirect:'follow'});const type=r.headers.get('content-type')||'';await r.body?.cancel();return {...item,status:r.ok?'http_reachable':'http_error',httpStatus:r.status,contentType:type,rightsStatus:'unverified',playbackVerified:false}}catch(e){return {...item,status:'unavailable_or_blocked',error:String(e.message||e).slice(0,120),rightsStatus:'unverified',playbackVerified:false}}finally{clearTimeout(t)}}
const results=[];for(let i=0;i<sample.length;i+=6)results.push(...await Promise.all(sample.slice(i,i+6).map(probe)));
const report={schema:'portal.tv.world-stream-health.v1',generatedAt:new Date().toISOString(),sampleSize:results.length,sampleStart:start,disclaimer:'HTTP-only bounded sample. Not exhaustive. No playback or rights certification; no auto-promotion.',results};
writeFileSync('world-tv-stream-health.json',JSON.stringify(report,null,2)+'\n');console.log('HTTP reachable:',results.filter(x=>x.status==='http_reachable').length,'of',results.length);
