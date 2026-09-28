const KEY="portal-world-events";const defs={redshift:{id:"redshift",label:"REDSHIFT",duration:18*60*1000,effects:["rift-pressure","oracle-noise","color-redshift","campfire-flare","void-aperture"]},stillness:{id:"stillness",label:"STILLNESS",duration:12*60*1000,effects:["rift-slow","color-muted","campfire-low"]}};
const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}},save=x=>localStorage.setItem(KEY,JSON.stringify(x));
export function activeEvents(now=Date.now()){const xs=load().filter(e=>e&&Number(e.endsAt)>now);save(xs);return xs}
export function beginEvent(id,{source="local",now=Date.now()}={}){const d=defs[id];if(!d)throw Error("unknown_event");const xs=activeEvents(now);const old=xs.find(e=>e.id===id);if(old)return old;const e={schema:"portal.world-event.v1",id:d.id,label:d.label,source,startedAt:now,endsAt:now+d.duration,effects:d.effects};xs.push(e);save(xs);window.dispatchEvent(new CustomEvent("portal:world-event",{detail:e}));return e}
export function eventHas(effect){return activeEvents().some(e=>Array.isArray(e.effects)&&e.effects.includes(effect))}
export function eventCatalog(){return Object.values(defs)}
