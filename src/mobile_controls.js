// Mobile-first control surface shared by campaign gameplay.
export function installMobileControls({onMove=()=>{},onAction=()=>{}}={}){
 const root=document.createElement("div");root.className="portal-mobile-controls";root.innerHTML=`
 <style>.portal-mobile-controls{position:fixed;inset:auto 0 14px;z-index:20;display:flex;justify-content:space-between;padding:14px;pointer-events:none}.pmc-pad,.pmc-actions{display:grid;gap:8px;pointer-events:auto}.pmc-pad{grid-template-columns:repeat(3,48px)}.pmc-actions{grid-template-columns:repeat(2,58px);align-content:end}.portal-mobile-controls button{width:48px;height:48px;border:1px solid #ffffff44;border-radius:50%;background:#08101dcc;color:#fff;font:18px system-ui;touch-action:none}.pmc-actions button{width:58px;height:58px;font-size:11px}.pmc-up{grid-column:2}.pmc-left{grid-column:1}.pmc-down{grid-column:2}.pmc-right{grid-column:3}@media(pointer:fine){.portal-mobile-controls{opacity:.28}}</style>
 <div class="pmc-pad"><button class="pmc-up" data-m="0,-1" aria-label="Move up">▲</button><button class="pmc-left" data-m="-1,0" aria-label="Move left">◀</button><button class="pmc-down" data-m="0,1" aria-label="Move down">▼</button><button class="pmc-right" data-m="1,0" aria-label="Move right">▶</button></div>
 <div class="pmc-actions"><button data-a="enter">ENTER</button><button data-a="interact">ACT</button></div>`;
 document.body.append(root);let held=new Map;
 const emit=()=>{let x=0,y=0;for(const [el,v] of held){if(el.matches(":active")||v.active){x+=v.x;y+=v.y}}onMove(Math.max(-1,Math.min(1,x)),Math.max(-1,Math.min(1,y)))};
 root.querySelectorAll("[data-m]").forEach(b=>{const [x,y]=b.dataset.m.split(",").map(Number);const stop=e=>{e.preventDefault();held.delete(b);emit()};b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);held.set(b,{x,y,active:true});emit()});b.addEventListener("pointerup",stop);b.addEventListener("pointercancel",stop)});
 root.querySelectorAll("[data-a]").forEach(b=>b.addEventListener("click",()=>onAction(b.dataset.a)));
 return {destroy(){root.remove()},root};
}
