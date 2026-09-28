const $=s=>document.querySelector(s);
const REMOTE="https://raw.githubusercontent.com/godsun108/Mint-capital-engine/main/agents/public/state.json";
load().then(render).catch(()=>fail("SNAPSHOT COULD NOT BE VERIFIED"));

async function load(){
 try{
  const r=await fetch(REMOTE,{cache:"no-store"}); if(!r.ok)throw 0;
  const x=await r.json(); if(x.schema!=="mint.agent-company.public.v1"||x.truth?.readOnly!==true)throw 0;
  const age=Date.now()-Date.parse(x.generatedAt); return {kind:age>86400000?"STALE_REMOTE":"REMOTE",raw:x};
 }catch{
  const r=await fetch("./state.json",{cache:"no-store"}); if(!r.ok)throw 0;
  return {kind:"LOCAL_FALLBACK",raw:await r.json()};
 }
}
function render({kind,raw}){
 if(raw.schema==="mint.agent-company.public.v1")renderRemote(kind,raw);else renderLocal(raw);
}
function renderRemote(kind,s){
 $("#mode").textContent=(kind==="REMOTE"?"VERIFIED READ-ONLY MINT SNAPSHOT":"STALE MINT SNAPSHOT")+" // "+s.generatedAt;
 const c=s.company; metrics(c.agents,c.settledRevenue,0,null);
 $("#mission").textContent=s.missions?.[0]?.objective||"NO PUBLIC MISSION";
 $("#pipeline").innerHTML=Object.entries(c.status||{}).map(([n,v])=>`<div class="worker ${n.toLowerCase()}"><i></i><strong>${esc(n)}</strong><small>${v} JOBS</small></div>`).join("");
 $("#gate").textContent=c.pendingApprovals?"HUMAN APPROVALS WAITING":"NO PUBLIC APPROVALS WAITING";
 $("#approvals").innerHTML=(s.approvals||[]).map(x=>`<div class="approval"><span>WAITING</span>${esc(x.action||x.id)}</div>`).join("")||'<div class="approval">NONE IN PUBLIC SNAPSHOT</div>';
 $("#truth").innerHTML=[`Source: MINT public snapshot`,`Read only: ${s.truth.readOnly}`,`Settlement authority: ${s.truth.settlementAuthority}`,kind==="STALE_REMOTE"?"WARNING: snapshot is older than 24 hours":"Freshness check passed"].map(x=>`<p>◌ ${esc(x)}</p>`).join("");
 $("#divisions").innerHTML='<span>PUBLIC TELEMETRY</span><span>NO COMMAND CHANNEL</span>';
}
function renderLocal(s){
 $("#mode").textContent="LOCAL FALLBACK // NO LIVE MINT SNAPSHOT";
 $("#mission").textContent=s.mission.name;metrics(s.workforce.agents,s.economics.settledRevenue,s.economics.settledCustomers,s.economics.targetSettledRevenue);
 $("#pipeline").innerHTML=s.mission.pipeline.map(([n,v])=>`<div class="worker ${v.toLowerCase()}"><i></i><strong>${n}</strong><small>${v}</small></div>`).join("");
 $("#gate").textContent=s.system.pilotGateLocked?"PILOT GATE LOCKED":"PILOT GATE OPEN";
 $("#approvals").innerHTML=s.approvals.map(x=>`<div class="approval"><span>WAITING</span>${esc(x)}</div>`).join("");
 $("#truth").innerHTML=s.truth.map(x=>`<p>◌ ${esc(x)}</p>`).join("");
 $("#divisions").innerHTML=s.workforce.divisions.map(x=>`<span>${esc(x)}</span>`).join("");
}
function metrics(agents,revenue,customers,target){$("#metrics").innerHTML=[["AGENTS",agents],["SETTLED",money(revenue)],["CUSTOMERS",customers??"—"],["PILOT TARGET",target==null?"—":money(target)]].map(card).join("")}
function card([k,v]){return `<article><small>${k}</small><strong>${v}</strong></article>`}function money(x){return "$"+Number(x||0).toFixed(2)}function esc(x){return String(x).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}function fail(x){$("#mode").textContent=x;$("#mode").classList.add("error")}
