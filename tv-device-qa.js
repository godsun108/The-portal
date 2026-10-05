// PORTAL TV device QA: private, explicit user reports; never upgrades global verified flags.
(function(){
 const root=document.getElementById('deviceQA');if(!root)return;
 const key='portal-tv-device-qa-v1',status=root.querySelector('#qaStatus'),list=root.querySelector('#qaHistory');
 function load(){try{return JSON.parse(localStorage.getItem(key)||'[]').filter(x=>x&&typeof x.url==='string').slice(0,50)}catch{return []}}
 function draw(){const items=load();list.replaceChildren();status.textContent=items.length+' local playback reports saved on this device';for(const x of items){const p=document.createElement('p');p.textContent=(x.ok?'✓ Worked':'✕ Failed')+' · '+x.name+' · '+new Date(x.at).toLocaleString();list.append(p)}}
 root.querySelectorAll('[data-qa]').forEach(button=>button.onclick=()=>{const active=window.portalActiveChannel;if(!active?.url){status.textContent='Tune a direct live channel first, then report the result.';return}const record={url:active.url,name:active.name||'Unnamed channel',ok:button.dataset.qa==='yes',at:new Date().toISOString(),userAgent:navigator.userAgent.slice(0,160)};try{localStorage.setItem(key,JSON.stringify([record,...load()].slice(0,50)));draw()}catch{status.textContent='Local storage is unavailable; report was not saved.'}});
 root.querySelector('#qaExport').onclick=()=>{const data=JSON.stringify({schema:'portal.tv.device.qa.v1',note:'Self-reported playback only; does not certify broadcaster rights or worldwide availability.',reports:load()},null,2);const blob=new Blob([data],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='portal-tv-device-qa.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 draw();
})();