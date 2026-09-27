/* PORTAL WORLD ENGINE v1 — browser-local connective tissue */
(()=>{"use strict";const K="portal-world-v1",now=Date.now();let w;try{w=JSON.parse(localStorage.getItem(K)||"null")}catch(e){}if(!w||typeof w!=="object")w={born:now,visits:0,pressure:0,events:[],scars:[],last:0};w.visits=(w.visits||0)+1;w.last=now;
const has=k=>localStorage.getItem(k)!==null,flag=k=>localStorage.getItem(k)==="1",add=(a,v)=>{if(!a.includes(v))a.push(v)},event=(id,text)=>{if(!w.events.some(x=>x.id===id)){w.events.push({id,text,t:now});w.events=w.events.slice(-24);return true}return false};
const inventory=[];if(flag("portal-item-feather"))inventory.push("black-feather");if(flag("portal-item-glass-seed"))inventory.push("glass-seed");w.inventory=inventory;
const facts={moon:flag("portal-moon-touched"),radio:flag("portal-radio-888"),numbers:has("portal-numbers"),void:flag("portal-artifact-void"),dream:flag("portal-dream"),arcade:flag("portal-arcade"),life:localStorage.getItem("portal-one-life"),button:+(localStorage.getItem("portal-button")||0),undernet:flag("portal-undernet"),rare:flag("portal-rare"),windowAnomaly:flag("portal-window-anomaly"),windowBreached:flag("portal-window-breached"),glassSeed:flag("portal-item-glass-seed")};
let pressure=inventory.length*2+(facts.moon?3:0)+(facts.radio?2:0)+(facts.numbers?1:0)+(facts.void?1:0)+(facts.dream?1:0)+(facts.arcade?2:0)+(facts.button>=13?2:0)+(facts.undernet?4:0)+(facts.windowAnomaly?2:0)+(facts.windowBreached?3:0)+(facts.glassSeed?3:0);w.pressure=Math.max(w.pressure||0,pressure);
if(facts.moon)add(w.scars,"moonless");if(facts.life==="dead")add(w.scars,"one-life-lost");if(facts.button>=13)add(w.scars,"button-thirteen");if(facts.windowAnomaly)add(w.scars,"window-saw-you");if(facts.windowBreached)add(w.scars,"window-breached");
if(facts.moon&&facts.radio)event("moon-radio","88.8 CHANGED AFTER THE MOON DISAPPEARED.");
if(inventory.includes("black-feather")&&facts.radio&&facts.void)event("feather-network","THREE ROOMS NOW KNOW ABOUT THE FEATHER.");
if(facts.button>=13)event("thirteen","SOMETHING COUGHED BEHIND THE WALLS.");
if(facts.life==="dead")event("death","ONE LIFE ENDED. THE WORLD DID NOT RESET.");
if(facts.windowAnomaly)event("watched","THE WINDOW SAW SOMETHING BACK.");if(facts.glassSeed)event("glass-seed","SOMETHING CROSSED THROUGH THE WINDOW.");
if(w.pressure>=8)event("awake","THE PORTAL IS NO LONGER ASLEEP.");
localStorage.setItem(K,JSON.stringify(w));window.PortalWorld={state:w,has,flag,event,save:()=>localStorage.setItem(K,JSON.stringify(w))};
document.documentElement.dataset.worldPressure=String(w.pressure);
})();