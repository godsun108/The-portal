import("./station-nav.js").catch(()=>{});
import{roomTone}from"./sound.js";
const HISTORY_KEY="portal-travel-history-v1";
function rememberRoom(room){
  if(!room)return;
  let xs=[];try{xs=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]")}catch(_){}
  if(!Array.isArray(xs))xs=[];
  const now=Date.now(),last=xs[xs.length-1];
  if(!last||last.room!==room||now-last.at>30000)xs.push({room:String(room).slice(0,64),at:now,path:location.pathname});
  localStorage.setItem(HISTORY_KEY,JSON.stringify(xs.slice(-80)));
  localStorage.setItem("portal-last-room",room);
  localStorage.setItem("portal-room-"+room,"1");
}
export function installTransitions(room){document.documentElement.dataset.portalRoom=room;rememberRoom(room);if(document.documentElement.dataset.portalTransitionsInstalled==="1")return;document.documentElement.dataset.portalTransitionsInstalled="1";requestAnimationFrame(()=>document.body?.classList.add("portal-arrived"));roomTone(room);document.addEventListener("click",e=>{const a=e.target.closest?.("a[href]");if(!a||a.target==="_blank"||e.metaKey||e.ctrlKey||e.shiftKey)return;let u;try{u=new URL(a.href,location.href)}catch{return}if(u.origin!==location.origin)return;e.preventDefault();document.body.classList.add("portal-leaving");setTimeout(()=>location.href=u.href,180)})}
