import{artifacts,scars}from"./games/state.js";import{physicsState}from"./physics.js";import{activeEvents}from"./events.js";import{soundEnabled,setSound,tone}from"./sound.js";
const root=new URL("./",import.meta.url),go=p=>new URL(p,root).href;
export function installTravelerHUD(){
 if(document.querySelector("[data-traveler-hud]"))return;
 const a=artifacts(),s=scars(),p=physicsState(),e=activeEvents();
 const hud=document.createElement("button");hud.dataset.travelerHud="";hud.type="button";hud.setAttribute("aria-label","Open Portal compass");hud.setAttribute("aria-expanded","false");
 hud.style.cssText="position:fixed;z-index:99999;right:14px;bottom:max(14px,env(safe-area-inset-bottom));min-width:58px;min-height:44px;border:1px solid #ffffff24;border-radius:999px;background:#07070bcc;color:#aaa;padding:10px 12px;font:9px ui-monospace;backdrop-filter:blur(12px);cursor:pointer;box-shadow:0 10px 35px #0008";
 hud.textContent=(e.length?"◉ ":"")+"⌁ "+a.length+" · "+s.length;
 const panel=document.createElement("div");panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Portal compass");
 panel.style.cssText="position:fixed;z-index:99998;right:14px;bottom:max(64px,calc(env(safe-area-inset-bottom) + 54px));width:min(330px,calc(100vw - 28px));border:1px solid #ffffff20;border-radius:20px;background:#08080df2;color:#aaa;padding:15px;font:10px/1.6 ui-monospace;backdrop-filter:blur(18px);box-shadow:0 20px 70px #000a";
 const render=()=>{const ev=activeEvents(),travelHistory=(()=>{try{return JSON.parse(localStorage.getItem("portal-travel-history-v1")||"[]")}catch(_){return[]}})();const room=document.documentElement.dataset.portalRoom||"unknown";
 panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><b style="color:#eee;letter-spacing:.12em">PORTAL COMPASS</b><span style="color:#5f5f6d">'+room.toUpperCase()+'</span></div><div style="margin:10px 0 12px;color:#666674">VISITS // '+history.length+' &nbsp; ARTIFACTS // '+a.length+' &nbsp; SCARS // '+s.length+(ev.length?' &nbsp; ◉ '+ev.map(x=>x.label).join(" + "):"")+'</div><nav style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><a data-nav href="'+go("")+'">⌂ HOME</a><a data-nav href="'+go("stations/")+'">◎ STATIONS</a><button data-back type="button">← BACK</button><a data-nav href="'+go("passport/")+'">▤ PASSPORT</a><a data-nav href="'+go("map/")+'">✣ MAP</a><a data-nav href="'+go("intelligence/")+'">◇ ASK PORTAL</a></nav><div style="border-top:1px solid #ffffff12;margin-top:12px;padding-top:10px">SOUND // <button data-sound type="button">'+(soundEnabled()?'ON':'OFF')+'</button></div>';
 panel.querySelectorAll("[data-nav],button[data-back],button[data-sound]").forEach(x=>x.style.cssText="min-height:42px;border:1px solid #ffffff18;border-radius:12px;background:#0d0d13;color:#bdbdc8;padding:10px;text-decoration:none;font:9px ui-monospace;letter-spacing:.08em;display:flex;align-items:center;justify-content:center;cursor:pointer");
 panel.querySelector("[data-back]").onclick=()=>travelHistory.length>1?historyBack():window.history.back();
 const sb=panel.querySelector("[data-sound]");sb.onclick=()=>{const on=setSound(!soundEnabled());sb.textContent=on?"ON":"OFF";if(on)tone({freq:261.63,duration:.4,gain:.02})};
 };
 const historyBack=()=>{window.history.back()};
 render();hud.onclick=()=>{panel.hidden=!panel.hidden;hud.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)render()};
 document.addEventListener("keydown",x=>{if(x.key==="Escape"&&!panel.hidden){panel.hidden=true;hud.setAttribute("aria-expanded","false")}});
 document.body.append(panel,hud)
}
const portalHudMobileStyle=document.createElement("style");portalHudMobileStyle.textContent="@media(max-width:699px){[data-traveler-hud]{bottom:max(82px,calc(env(safe-area-inset-bottom) + 72px))!important;right:12px!important}}";document.head.append(portalHudMobileStyle);
