// PORTAL TV bulk IPTV discovery: research candidates only, never auto-admit or publish playback.
const fs=require('node:fs');
const base='https://iptv-org.github.io/api/';
const endpoints=['channels.json','streams.json','blocklist.json'];
async function load(name){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);try{const r=await fetch(base+name,{signal:controller.signal});if(!r.ok)throw Error(name+' HTTP '+r.status);return await r.json()}finally{clearTimeout(timeout)}}
function validURL(raw){try{const u=new URL(raw);return u.protocol==='https:'&&/\\.m3u8$/i.test(u.pathname)&&!u.username&&!u.password}catch{return false}}
async function main(){
 const [channels,streams,blocklist]=await Promise.all(endpoints.map(load));
 const lookup=new Map(channels.filter(c=>c.id&&!c.is_nsfw&&!c.closed).map(c=>[c.id,c]));
 const blocked=new Set(blocklist.map(b=>b.channel));
 const categories=new Set(['sports','business','news','documentary','science','music','entertainment','education','travel']);
 const seen=new Set(),items=[];
 for(const s of streams){
  const ch=lookup.get(s.channel);
  if(!ch||blocked.has(ch.id)||s.referrer||s.user_agent||!validURL(s.url)||seen.has(ch.id))continue;
  const genres=(ch.categories||[]).filter(g=>categories.has(g));
  if(!genres.length)continue;
  seen.add(ch.id);
  items.push({id:ch.id,name:ch.name,country:ch.country,categories:genres,streamUrl:s.url,quality:s.quality||null,labels:s.labels||[],website:ch.website||null,source:base+'streams.json',rightsStatus:'unverified',playbackStatus:'untested',admitted:false});
 }
 items.sort((a,b)=>a.name.localeCompare(b.name));
 const out={schema:'portal.tv.iptv-discovery.v1',generatedAt:new Date().toISOString(),source:base,policy:'Research candidates only. Public playlist inclusion does not establish rebroadcast or embedding permission, live availability, or iPhone compatibility. Do not feed this file directly to the player.',counts:{channels:channels.length,streams:streams.length,candidates:items.length},items};
 fs.writeFileSync('tv-iptv-discovery.json',JSON.stringify(out,null,2)+'\\n');
 console.log('Staged '+items.length+' unverified candidates; none admitted.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
