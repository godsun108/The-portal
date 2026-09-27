// CAMPFIRE presence reference service — Node 20+, no dependencies.
// Stateful single-instance v0. For multi-instance deployment replace Map with shared TTL storage.
import http from "node:http";
const PORT=Number(process.env.PORT||8787);
const ORIGINS=new Set((process.env.PORTAL_ORIGINS||"https://godsun108.github.io").split(",").map(x=>x.trim()).filter(Boolean));
const leases=new Map(),MAX_LEASE=60,MAX_BODY=4096;
const clean=()=>{const n=Date.now();for(const [id,until] of leases)if(until<=n)leases.delete(id)};
const headers=o=>({"content-type":"application/json","cache-control":"no-store","access-control-allow-origin":o,"access-control-allow-methods":"POST,DELETE,OPTIONS","access-control-allow-headers":"content-type","vary":"Origin"});
const send=(res,status,obj,o)=>{res.writeHead(status,headers(o));res.end(JSON.stringify(obj))};
http.createServer((req,res)=>{const origin=req.headers.origin||"";if(!ORIGINS.has(origin)){res.writeHead(403);return res.end()}if(req.method==="OPTIONS"){res.writeHead(204,headers(origin));return res.end()}clean();
if(req.method==="POST"&&req.url==="/v0/presence/campfire"){let raw="";req.on("data",d=>{raw+=d;if(raw.length>MAX_BODY)req.destroy()});req.on("end",()=>{try{const b=JSON.parse(raw),id=String(b.visitor_id||"");if(!/^[A-Za-z0-9-]{8,80}$/.test(id))return send(res,400,{error:"invalid visitor"},origin);const sec=Math.max(10,Math.min(MAX_LEASE,Number(b.lease_seconds)||45));leases.set(id,Date.now()+sec*1000);clean();send(res,200,{schema:"portal.presence.v0",room:"campfire",verified:true,others:Math.max(0,leases.size-1),lease_seconds:sec,observed_at:new Date().toISOString()},origin)}catch(e){send(res,400,{error:"invalid request"},origin)}});return}
const m=req.url?.match(/^\/v0\/presence\/campfire\/([A-Za-z0-9-]{8,80})$/);if(req.method==="DELETE"&&m){leases.delete(m[1]);res.writeHead(204,headers(origin));return res.end()}send(res,404,{error:"not found"},origin)
}).listen(PORT,()=>console.log("CAMPFIRE presence listening on",PORT));
