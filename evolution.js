/* PORTAL EVOLUTION v3 — deterministic world development from truthful journey state. */
import{journey,journeyLog,record}from"./journey.js";
const KEY="portal-evolution-v3",DAY=86400000;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}};
const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
function derive(j){
 const depth=Math.min(4,(j.roomCount>=18?2:j.roomCount>=10?1:0)+(j.converged?1:0)+(j.fork?1:0));
 const rhythm=j.dailyCompleted>=7?"ritual":j.dailyCompleted>=3?"returning":"unformed";
 const memory=j.scars.length>=12?"scarred":j.artifacts.length>=5?"carrying":j.roomCount>=7?"aware":"quiet";
 const age=j.ageDays>=30?"old":j.ageDays>=7?"seasoned":j.ageDays>=1?"awake":"new";
 return{depth,rhythm,memory,age};
}
export function evolution(){
 const j=journey(),prior=read()||{schema:"portal.evolution.v3",born:Date.now(),revision:0,changes:[]},traits=derive(j);
 const signature=[traits.depth,traits.rhythm,traits.memory,traits.age,j.fork||"-",j.converged?1:0].join("|");
 if(prior.signature!==signature){
   const change={at:new Date().toISOString(),from:prior.signature||null,to:signature,traits};
   prior.signature=signature;prior.traits=traits;prior.revision=(prior.revision||0)+1;prior.changes=[...(prior.changes||[]),change].slice(-24);save(prior);
   record("evolution",{revision:prior.revision,signature});
 }
 return Object.freeze({...prior,traits,journey:j});
}
export function roomEffect(room){
 const e=evolution(),t=e.traits,out={room,revision:e.revision,classes:[],message:null};
 if(t.depth>=2)out.classes.push("portal-evolved-deep");
 if(t.memory==="scarred")out.classes.push("portal-evolved-scarred");
 if(t.rhythm==="ritual")out.classes.push("portal-evolved-ritual");
 if(t.age==="old")out.classes.push("portal-evolved-old");
 const messages={
   earth:t.age==="old"?"THE SAME EARTH. NOT THE SAME VISIT.":null,
   signal:t.memory==="scarred"?"THE RECEIVER RECOGNIZES THE SHAPE OF YOUR HISTORY.":null,
   void:t.depth>=3?"THE VOID IS NO LONGER EMPTY IN THE SAME WAY.":null,
   arcade:t.rhythm==="ritual"?"THE MACHINES HAVE SEEN YOUR ROUTINE.":null,
   daily:t.rhythm==="ritual"?"THIS IS A PRACTICE NOW, NOT AN ACCIDENT.":null,
   map:t.depth>=2?"THE MAP HAS DEPTH IT DID NOT HAVE AT FIRST CONTACT.":null,
   passport:t.memory==="scarred"?"THIS DOCUMENT NOW DESCRIBES A HISTORY, NOT A VISITOR.":null,
   clock:t.age!=="new"?"TIME HAS BECOME PART OF THE WORLD STATE.":null
 };
 out.message=messages[room]||null;return out;
}
export function installEvolution(room=document.documentElement.dataset.portalRoom||"home"){
 const e=evolution(),fx=roomEffect(room);document.documentElement.dataset.portalEvolution=String(e.revision);document.documentElement.dataset.portalAge=e.traits.age;fx.classes.forEach(x=>document.documentElement.classList.add(x));
 if(fx.message)document.documentElement.dataset.portalEvolutionMessage=fx.message;
 window.PortalEvolution=e;window.dispatchEvent(new CustomEvent("portal:evolution",{detail:{evolution:e,effect:fx}}));return fx;
}
