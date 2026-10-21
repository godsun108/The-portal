import {paintAtlas,preloadAtlas} from './sprite-atlas.mjs';
import {bankFromDelta,lerp} from './animation-engine.mjs';
import {enemyKind,drawVariant} from './enemy-visuals.mjs';
import {burst,stepParticles,paintParticles,clearParticles,drawNebula,drawGuardian} from './cinematic-fx.mjs';
import {drawThrusters,drawEnemy,drawShield} from './visual-effects.mjs';
import {verifiedTestSkin} from './commerce/equipment.mjs';
import {catalog,fresh,validate,purchase,equip,reward} from './economy.mjs';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),key='earthchain.starfall.local.v1';
let save=fresh(),storageOK=true,chainSkin=null;
const hullNames={"solar-lion":"Solar Lion","fire-horse":"Fire Horse","earth-steward":"Earth Steward","starfall-celestial-crown":"Celestial Crown"};
function renderChainStatus(){
 const label=$('chain-equipment');
 if(chainSkin&&Date.now()>=chainSkin.expiresAt)chainSkin=null;
 if(chainSkin){
  const remaining=Math.max(0,Math.ceil((chainSkin.expiresAt-Date.now())/1000));
  label.textContent="Equipped: "+(hullNames[chainSkin.id]||chainSkin.id)+" · signed ECTEST ownership verified · expires in "+Math.floor(remaining/60)+"m "+String(remaining%60).padStart(2,"0")+"s";
 }else{
  label.textContent="No current verified ECTEST hull. Refresh ownership in the wallet checkout to use a test collectible.";
 }
}
async function refreshChain(){chainSkin=await verifiedTestSkin();renderChainStatus();}

refreshChain();window.addEventListener('focus',refreshChain);
for(const id of ['fire-horse','solar-lion'])preloadAtlas(id);
try{const raw=localStorage.getItem(key);if(raw)save=validate(JSON.parse(raw));}catch{storageOK=false;$('message').textContent='Save unavailable or invalid; using a fresh session.';}
function persist(){try{localStorage.setItem(key,JSON.stringify(save));}catch{storageOK=false;}if(!storageOK)$('message').textContent='Progress is available this session; browser saving may be unavailable.';renderShop();}
function renderShop(){ $('balance').textContent=save.credits+' game credits';$('lock').textContent=save.cleared?'Hangar unlocked. Hulls change appearance only.':'Defeat the guardian to unlock cosmetic hulls.';$('cards').replaceChildren();for(const item of catalog){const card=document.createElement('article');card.className='card';card.innerHTML=`<div class="ship" style="color:${item.color}">⟁</div><h3>${item.name}</h3><p>${item.description} · ${item.price} credits</p>`;const b=document.createElement('button');const owned=save.owned.includes(item.id);b.textContent=save.equipped===item.id?'Equipped':owned?'Equip hull':'Unlock · '+item.price;b.disabled=save.equipped===item.id||(!owned&&(!save.cleared||save.credits<item.price));b.onclick=()=>{try{save=owned?equip(save,item.id):purchase(save,item.id);persist();$('message').textContent=item.name+' equipped locally.';}catch(e){$('message').textContent=e.message;}};card.append(b);$('cards').append(card);}}
let run=null,paused=false,last=0,keys=new Set(),target=null,visualBank=0,previousX=null;
const stars=Array.from({length:85},()=>({x:Math.random()*600,y:Math.random()*700,r:Math.random()*1.5+.4}));
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;}window.addEventListener('resize',resize);resize();
function launch(){visualBank=0;previousX=null;clearParticles();run={t:0,x:300,y:580,hp:5,inv:0,shots:[],foes:[],seeds:[],bolts:[],spawn:0,fire:0,seedAt:0,bossHP:65,bossAt:0,seedCount:0,ended:false};paused=false;target=null;keys.clear();$('overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='Pause';canvas.focus();}
function finish(won){if(!run||run.ended)return;run.ended=true;
// Device-local personal best only. This is NOT an authenticated global score.
const score=Math.max(0,Math.floor(run.t)) + run.seedCount*50 + (won?1000:0);
try{
 const keyBest='earthplay.starfall.personal-best.v1';
 const prior=Number(localStorage.getItem(keyBest))||0;
 if(score>prior)localStorage.setItem(keyBest,String(score));
 $('personal-best').textContent=String(Math.max(prior,score));
}catch{$('personal-best').textContent=String(score)+' (session only)'}
$('last-score').textContent=String(score);
$('arena-return').textContent='🏆 View '+String(score)+' points in the Arena ↗';
save=reward(save,won);persist();$('overlay').hidden=false;$('title').textContent=won?'The light returns.':'Your next flight awaits.';$('description').textContent=won?'Guardian defeated. +60 local game credits. Your endgame hangar is unlocked. Choose a hull below and fly again.':'Hull lost. +10 local game credits for the expedition. Keep moving and collect green seeds to repair your ship.';$('start').textContent='Fly again';$('pause').disabled=true;}
function pause(){if(!run||run.ended)return;paused=!paused;keys.clear();target=null;$('pause').textContent=paused?'Resume':'Pause';}
$('start').onclick=launch;$('pause').onclick=pause;
window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON')return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','p'].includes(k)){e.preventDefault();if(k==='p'&&!e.repeat)pause();else keys.add(k);}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(run&&!run.ended&&!paused)pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!run.ended&&!paused)pause();});
function point(e){const b=canvas.getBoundingClientRect();target={x:(e.clientX-b.left)/b.width*600,y:(e.clientY-b.top)/b.height*700};}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);point(e);});canvas.addEventListener('pointermove',e=>{if(canvas.hasPointerCapture(e.pointerId))point(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>target=null);
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function ship(x,y,color,hull='default',time=0){
 ctx.save();ctx.translate(x,y);
 const flicker=3+Math.sin(time/115)*2;
 ctx.shadowBlur=14;ctx.shadowColor=color;
 if(hull==='starfall-celestial-crown'){
  // Champion-only cosmetic, no collision, damage, speed or scoring changes.
  ctx.shadowBlur=23;ctx.shadowColor='#ffd77a';
  ctx.fillStyle='#214eac';ctx.strokeStyle='#ffdc83';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(15,-10);ctx.lineTo(24,13);ctx.lineTo(8,8);ctx.lineTo(0,14);ctx.lineTo(-8,8);ctx.lineTo(-24,13);ctx.lineTo(-15,-10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffe9a1';ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(5,-8);ctx.lineTo(0,-1);ctx.lineTo(-5,-8);ctx.closePath();ctx.fill();
  for(const side of [-1,1]){ctx.fillStyle='#7edaff';ctx.fillRect(side*12-2,12,4,9+flicker);ctx.fillStyle='#ffcf65';ctx.fillRect(side*12-1,15,2,6+flicker);}
 }else if(hull==='fire-horse'){
  ctx.fillStyle='#ff724e';ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(10,-7);ctx.lineTo(21,15);ctx.lineTo(7,10);ctx.lineTo(0,4);ctx.lineTo(-7,10);ctx.lineTo(-21,15);ctx.lineTo(-10,-7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffc078';ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(5,1);ctx.lineTo(0,9);ctx.lineTo(-5,1);ctx.fill();
  for(const side of [-1,1]){ctx.fillStyle='#ff9d40';ctx.fillRect(side*11-2,11,4,8+flicker);ctx.fillStyle='#ffe0a0';ctx.fillRect(side*11-1,12,2,4);}
 }else if(hull==='solar-lion'){
  ctx.fillStyle='#ffc65c';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(10,-9);ctx.lineTo(23,3);ctx.lineTo(18,16);ctx.lineTo(0,8);ctx.lineTo(-18,16);ctx.lineTo(-23,3);ctx.lineTo(-10,-9);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff1a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-17,4);ctx.lineTo(-5,-3);ctx.lineTo(0,-16);ctx.lineTo(5,-3);ctx.lineTo(17,4);ctx.stroke();
  ctx.fillStyle='#ffdf79';ctx.beginPath();ctx.arc(0,1,5,0,Math.PI*2);ctx.fill();
  for(const side of [-1,1]){ctx.fillStyle='#ffe38d';ctx.fillRect(side*12-2,14,4,6+flicker);}
 }else{
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(16,15);ctx.lineTo(0,7);ctx.lineTo(-16,15);ctx.closePath();ctx.fill();
  circle(0,20,4,'#edb875');
 }
 ctx.restore();
}
function update(dt){const r=run;r.t+=dt;r.inv=Math.max(0,r.inv-dt);const boss=r.t>=36;const sector=Math.min(3,1+Math.floor(r.t/12));if(target){r.x+=(target.x-r.x)*Math.min(1,dt*12);r.y+=(target.y-r.y)*Math.min(1,dt*12);}else{r.x+=((keys.has('d')||keys.has('arrowright'))-(keys.has('a')||keys.has('arrowleft')))*320*dt;r.y+=((keys.has('s')||keys.has('arrowdown'))-(keys.has('w')||keys.has('arrowup')))*320*dt;}r.x=Math.max(20,Math.min(580,r.x));r.y=Math.max(boss?190:35,Math.min(675,r.y));r.fire-=dt;if(r.fire<=0){r.shots.push({x:r.x,y:r.y-20});r.fire=.16;}r.spawn-=dt;if(r.spawn<=0&&!boss){r.foes.push({x:25+Math.random()*550,y:-20,speed:90+sector*25,kind:enemyKind(sector,r.foes.length),seed:r.t});r.spawn=.85-sector*.13;}r.seedAt-=dt;if(r.seedAt<=0){r.seeds.push({x:25+Math.random()*550,y:-20});r.seedAt=5;}
const bx=300+Math.sin(r.t*1.2)*175;if(boss){r.bossAt-=dt;if(r.bossAt<=0){for(let i=-2;i<=2;i++)r.bolts.push({x:bx,y:140,vx:i*65});r.bossAt=.9;}}
for(const s of r.shots){s.y-=490*dt;if(boss&&Math.abs(s.x-bx)<50&&s.y<145&&s.y>65){r.bossHP--;burst(s.x,s.y,'#ffd096',5);s.y=-99;}for(const f of r.foes)if(!f.dead&&Math.hypot(s.x-f.x,s.y-f.y)<23){f.dead=true;burst(f.x,f.y,'#ff8c74',10);s.y=-99;break;}}
for(const f of r.foes)f.y+=f.speed*dt;for(const b of r.bolts){b.y+=220*dt;b.x+=b.vx*dt;}for(const s of r.seeds){s.y+=100*dt;if(Math.hypot(s.x-r.x,s.y-r.y)<28){r.hp=Math.min(5,r.hp+1);r.seedCount++;s.y=999;}}
for(const f of [...r.foes.filter(f=>!f.dead),...r.bolts])if(!r.inv&&Math.hypot(f.x-r.x,f.y-r.y)<25){r.hp--;r.inv=1.2;burst(r.x,r.y,'#b8fff0',12);f.y=999;}
r.shots=r.shots.filter(s=>s.y>-30);r.foes=r.foes.filter(f=>!f.dead&&f.y<740);r.bolts=r.bolts.filter(b=>b.y<740);r.seeds=r.seeds.filter(s=>s.y<740);$('hud').textContent=(boss?'GUARDIAN '+Math.max(0,r.bossHP):'SECTOR '+sector+' / 3')+' · HULL '+r.hp+'/5';if(r.hp<=0)finish(false);else if(r.bossHP<=0)finish(true);}
let lastChainStatusSecond=-1;
function draw(now){const second=Math.floor(Date.now()/1000);if(second!==lastChainStatusSecond){lastChainStatusSecond=second;renderChainStatus();}if(chainSkin&&Date.now()>=chainSkin.expiresAt){chainSkin=null;renderChainStatus();}const dt=Math.min(.04,(now-last)/1000||0);last=now;if(run&&!run.ended&&!paused){const beforeX=run.x;update(dt);stepParticles(dt);visualBank=lerp(visualBank,bankFromDelta(run.x-beforeX,dt),Math.min(1,dt*11));previousX=run.x;}ctx.setTransform(canvas.width/600,0,0,canvas.height/700,0,0);ctx.fillStyle='#07121d';ctx.fillRect(0,0,600,700);const gradient=ctx.createRadialGradient(450,230,0,450,230,380);gradient.addColorStop(0,'#123c42');gradient.addColorStop(1,'#07121d');ctx.fillStyle=gradient;ctx.fillRect(0,0,600,700);drawNebula(ctx,now);for(const s of stars){if(!paused)s.y=(s.y+dt*18)%700;circle(s.x,s.y,s.r,'#93bcc6');}ctx.strokeStyle='#285b5f';ctx.lineWidth=1;ctx.beginPath();ctx.arc(470,190,105,0,Math.PI*2);ctx.stroke();if(run){for(const s of run.shots){ctx.fillStyle='#b8ffd7';ctx.fillRect(s.x-2,s.y-9,4,15);}for(const f of run.foes)drawVariant(ctx,f.x,f.y,now,f.kind||'sentinel',f.seed||0);for(const b of run.bolts)circle(b.x,b.y,6,'#ffae7f');for(const s of run.seeds){circle(s.x,s.y,10,'#72efb9');circle(s.x,s.y,4,'#e7ffde');}if(run.t>=36&&run.bossHP>0){const x=300+Math.sin(run.t*1.2)*175;drawGuardian(ctx,x,105,now,run.bossHP);}paintParticles(ctx);if(!run.inv||Math.floor(now/90)%2){const hull=chainSkin?.id||save.equipped;ctx.save();ctx.translate(run.x,run.y);ctx.rotate(visualBank);drawThrusters(ctx,0,0,now,hull);if(!paintAtlas(ctx,hull,now))ship(0,0,catalog.find(i=>i.id===hull)?.color||'#c4fff0',hull,now);ctx.restore();}if(run.inv>0)drawShield(ctx,run.x,run.y,now);}else ship(300,490,'#c4fff0');if(paused&&run&&!run.ended){ctx.fillStyle='#07121dcc';ctx.fillRect(0,0,600,700);ctx.fillStyle='#dcfff0';ctx.font='26px system-ui';ctx.textAlign='center';ctx.fillText('Paused — tap Resume',300,350);}requestAnimationFrame(draw);}
renderShop();requestAnimationFrame(draw);
