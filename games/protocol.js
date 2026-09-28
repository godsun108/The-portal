const KEY="portal-game-history";
const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}};
const runId=()=>{try{return crypto.randomUUID()}catch{return Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)}};
export function beginRun(game){return{schema:"portal.game.run.v1",id:runId(),game,startedAt:new Date().toISOString(),events:[]}}
export function event(run,type,data={}){if(run&&Array.isArray(run.events))run.events.push({at:Date.now(),type,data});return run}
export function finishRun(run,outcome){if(!run)return null;const done={...run,finishedAt:new Date().toISOString(),outcome};const history=load();history.unshift(done);localStorage.setItem(KEY,JSON.stringify(history.slice(0,50)));window.dispatchEvent(new CustomEvent("portal:game-finished",{detail:done}));return done}
export function history(){return load()}
