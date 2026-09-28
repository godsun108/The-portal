import{artifactId}from"./games/state.js";
/* PORTAL JOURNEY v2 — canonical read model over durable v1 browser history.
   V2 does not erase or rename v1 keys. It makes the existing world legible as one machine. */
const DAY=86400000;
const json=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||"null");return v??fallback}catch{return fallback}};
const uniq=xs=>[...new Set(xs.filter(Boolean))];
export function journey(){
 const world=json("portal-world-v1",{}),travel=json("portal-travel-history-v1",[]),art=json("portal-game-artifacts",[]),gameScars=json("portal-game-scars",[]),eventState=json("portal-world-events-v1",{history:[]});
 const rooms=uniq((Array.isArray(travel)?travel:[]).map(x=>x?.room));
 const artifacts=uniq((Array.isArray(art)?art:[]).map(artifactId));
 const scars=uniq([...(Array.isArray(world.scars)?world.scars:[]),...(Array.isArray(gameScars)?gameScars:[]).map(id)]);
 const events=uniq([...(Array.isArray(world.events)?world.events:[]).map(id),...(Array.isArray(eventState.history)?eventState.history:[]).map(id)]);
 const born=Number(world.born)||Date.now(),last=Number(world.last)||born,away=Math.max(0,Number(world.awayMs)||0);
 const completedDaily=Object.keys(localStorage).filter(k=>k.startsWith("portal-daily-complete-")&&localStorage.getItem(k)==="1").length;
 return Object.freeze({schema:"portal.journey.v2",traveler:localStorage.getItem("portal-passport-id")||null,born,last,ageDays:Math.floor((Date.now()-born)/DAY),awayMs:away,returnBand:world.returnBand||"present",visits:Number(world.visits)||0,pressure:Number(world.pressure)||0,atmosphere:world.atmosphere||"STILL",rooms,roomCount:rooms.length,artifacts,scars,events,inventory:Array.isArray(world.inventory)?world.inventory:[],dailyCompleted:completedDaily,converged:localStorage.getItem("portal-convergence")==="1",fork:localStorage.getItem("portal-world-fork")||null});
}
export function consequence(){
 const j=journey(),out=[];
 if(j.awayMs>=DAY)out.push({id:"absence",text:j.awayMs>=7*DAY?"THE PORTAL HAD A WEEK WITHOUT YOU.":"THE PORTAL CONTINUED WHILE YOU WERE AWAY."});
 if(j.roomCount>=13)out.push({id:"known-route",text:"THIRTEEN ROOMS REMEMBER YOUR ROUTE."});else if(j.roomCount>=7)out.push({id:"known-route",text:"THE PORTAL HAS STARTED RECOGNIZING YOUR ROUTE."});
 if(j.converged)out.push({id:"convergence",text:"THE ROOMS ARE NO LONGER PRETENDING TO BE SEPARATE."});
 if(j.fork)out.push({id:"fork",text:"THIS WORLD CONTINUED "+j.fork.toUpperCase()+". ANOTHER VERSION DID NOT."});
 if(j.dailyCompleted>=3)out.push({id:"daily",text:j.dailyCompleted+" DAILY DOORS HAVE BEEN CARRIED INTO THE WORLD."});
 return out;
}
export function record(kind,data={}){
 const key="portal-journey-v2-log",xs=json(key,[]),entry={kind,at:new Date().toISOString(),...data};xs.push(entry);localStorage.setItem(key,JSON.stringify(xs.slice(-100)));window.dispatchEvent(new CustomEvent("portal:journey",{detail:entry}));return entry;
}
export function journeyLog(){const xs=json("portal-journey-v2-log",[]);return Array.isArray(xs)?xs:[]}
