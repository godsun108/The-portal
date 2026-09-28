/* PORTAL WORLD EVENTS v2 — earned from real local journey state; never fabricated activity */
(()=>{"use strict";
const now=Date.now(),HOUR=3600000,DAY=24*HOUR,key="portal-world-events-v1";
let state;try{state=JSON.parse(localStorage.getItem(key)||"null")}catch(e){}
if(!state||typeof state!=="object")state={history:[]};if(!Array.isArray(state.history))state.history=[];
const flag=k=>localStorage.getItem(k)==="1";
const travel=(()=>{try{const x=JSON.parse(localStorage.getItem("portal-travel-history-v1")||"[]");return Array.isArray(x)?x:[]}catch(_){return[]}})();
const rooms=[...new Set(travel.map(x=>x.room).filter(Boolean))],seen=new Set(rooms);
const hasAny=xs=>xs.some(x=>seen.has(x)),firstContact=new Date(localStorage.getItem("portal-first-contact")||now).getTime();
const rules=[
 {id:"resonance",duration:6*HOUR,eligible:()=>flag("portal-signal-shard-resonance")&&flag("portal-machine-shard-exposure"),text:"SOMETHING IS RESONATING ACROSS ROOMS."},
 {id:"seven-doors",duration:3*HOUR,eligible:()=>rooms.length>=7,text:"THE PORTAL HAS STARTED RECOGNIZING YOUR ROUTE."},
 {id:"cross-current",duration:4*HOUR,eligible:()=>hasAny(["earth","window","weather","sky","pulse"])&&hasAny(["undernet","void","dead","blackbox"]),text:"TWO LAYERS OF THE PORTAL ARE AWARE OF EACH OTHER."},
 {id:"return-signal",duration:2*HOUR,eligible:()=>now-firstContact>=DAY&&travel.length>=3,text:"YOU LEFT. THE PORTAL DID NOT RESET."},
 {id:"thirteen-doors",duration:6*HOUR,eligible:()=>rooms.length>=13,text:"THIRTEEN ROOMS HAVE YOUR FOOTPRINTS."}
];
let active=null;
for(const r of rules){
 let prior=state.history.find(e=>e.id===r.id);
 if(prior&&now<prior.ends){active={...r,started:prior.started,ends:prior.ends};break}
 if(!prior&&r.eligible()){prior={id:r.id,started:now,ends:now+r.duration};state.history.push(prior);active={...r,...prior};break}
}
state.history=state.history.slice(-24);localStorage.setItem(key,JSON.stringify(state));
if(active){document.documentElement.dataset.worldEvent=active.id;localStorage.setItem("portal-event-"+active.id,"1")}
window.PortalEvents={active,state,rules:rules.map(({id,text})=>({id,text}))};
})();