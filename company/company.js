const $=s=>document.querySelector(s);fetch("./state.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("snapshot unavailable");return r.json()}).then(s=>{
 $("#mode").textContent=s.liveBackend?"LIVE VERIFIED BACKEND":"LOCAL SNAPSHOT // NO LIVE BACKEND";
 $("#mission").textContent=s.mission.name;
 $("#metrics").innerHTML=[["AGENTS",s.workforce.agents],["SETTLED",money(s.economics.settledRevenue)],["CUSTOMERS",s.economics.settledCustomers],["PILOT TARGET",money(s.economics.targetSettledRevenue)]].map(card).join("");
 $("#pipeline").innerHTML=s.mission.pipeline.map(([n,v])=>`<div class="worker ${v.toLowerCase()}"><i></i><strong>${n}</strong><small>${v}</small></div>`).join("");
 $("#gate").textContent=s.system.pilotGateLocked?"PILOT GATE LOCKED":"PILOT GATE OPEN";
 $("#approvals").innerHTML=s.approvals.map(x=>`<div class="approval"><span>WAITING</span>${esc(x)}</div>`).join("");
 $("#truth").innerHTML=s.truth.map(x=>`<p>◌ ${esc(x)}</p>`).join("");
 $("#divisions").innerHTML=s.workforce.divisions.map(x=>`<span>${esc(x)}</span>`).join("");
}).catch(()=>{$("#mode").textContent="SNAPSHOT COULD NOT BE VERIFIED";$("#mode").classList.add("error")});
function card([k,v]){return `<article><small>${k}</small><strong>${v}</strong></article>`}function money(x){return "$"+Number(x).toFixed(2)}function esc(x){return String(x).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}
