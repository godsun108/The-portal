import {createFriendRun,downloadFriendRun,readFriendRun} from './friend-run.mjs';
import {verifiedAscensionCosmetics} from './earthchain-bridge.mjs';
import {WORLDS,nextBoss,bossHealth,campaignComplete} from './campaign.mjs';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),cabinet=document.querySelector('#cabinet');
const heightEl=document.querySelector('#height'),chapterEl=document.querySelector('#chapter'),relicEl=document.querySelector('#relics'),armorEl=document.querySelector('#armor'),intro=document.querySelector('#intro'),end=document.querySelector('#end');
const boostBtn=document.querySelector('#boost'),blastBtn=document.querySelector('#blast'),controls=document.querySelector('.controls');
let W=360,H=640,D=1,raf=0,last=0,game=null,pointer=null,boostHeld=false,leftHeld=false,rightHeld=false,importedGhost=null,ascensionCosmetic=null;
async function refreshEarthchainCosmetic(){const result=await verifiedAscensionCosmetics();ascensionCosmetic=result.state==='verified'?result.cosmetics[0]||null:null;const status=document.querySelector('#wallet-status');if(status)status.textContent=ascensionCosmetic?'EARTHCHAIN VERIFIED · '+ascensionCosmetic.label:'STANDARD ARMOR · CONNECT STARFALL WALLET FOR VERIFIED COSMETICS';}
refreshEarthchainCosmetic();
const GHOST_KEY='ascension.ghost.v1',GHOST_SCHEMA=1,GHOST_SAMPLE=.1;
function loadBestGhost(){try{const raw=localStorage.getItem(GHOST_KEY);if(!raw)return null;const data=JSON.parse(raw);if(data.schema!==GHOST_SCHEMA||!Array.isArray(data.samples)||data.samples.length<2||data.samples.length>12000||!Number.isFinite(data.height))return null;let prev=-1;for(const s of data.samples){if(!Array.isArray(s)||s.length!==3||!s.every(Number.isFinite)||s[0]<=prev||s[1]<0||s[2]<0||s[2]>1)return null;prev=s[0]}return data}catch{return null}}
function saveBestGhost(g){if(!g?.recording||g.recording.length<2)return false;const old=loadBestGhost();if(old&&old.height>=g.height)return false;const data={schema:GHOST_SCHEMA,height:Math.floor(g.height),relics:g.count,duration:g.elapsed,samples:g.recording.slice(0,12000)};try{localStorage.setItem(GHOST_KEY,JSON.stringify(data));return true}catch{return false}}
function sampleGhost(g){if(g.elapsed-g.lastGhostSample<GHOST_SAMPLE)return;g.lastGhostSample=g.elapsed;g.recording.push([Number(g.elapsed.toFixed(2)),Number(g.height.toFixed(1)),Number(clamp(g.x/W,0,1).toFixed(4))]);if(g.recording.length>12000)g.recording.shift()}
function ghostAt(data,t){if(!data||t<data.samples[0][0]||t>data.samples[data.samples.length-1][0])return null;let lo=0,hi=data.samples.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(data.samples[mid][0]<=t)lo=mid;else hi=mid}const a=data.samples[lo],b=data.samples[hi],span=b[0]-a[0],k=span>0?(t-a[0])/span:0;return{height:a[1]+(b[1]-a[1])*k,x:a[2]+(b[2]-a[2])*k}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
function resize(){D=Math.min(devicePixelRatio||1,2);const r=cabinet.getBoundingClientRect();W=r.width;H=r.height;canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0)}
new ResizeObserver(resize).observe(cabinet);resize();
function platform(y,x=rand(20,W-100),w=rand(62,96),kind='solid'){return{x,y,w,h:10,kind,phase:rand(0,6.28),used:false}}
function start(){cancelAnimationFrame(raf);pointer=null;boostHeld=false;leftHeld=false;rightHeld=false;const ps=[platform(H-100,W*.38,100)];for(let i=1;i<12;i++)ps.push(platform(H-100-i*78,rand(12,W-92),rand(62,98),i%7===0?'moving':'solid'));
 game={x:W*.5,y:H-142,vx:0,vy:-470,camera:0,cosmetic:ascensionCosmetic,chapter:0,boss:null,platforms:ps,enemies:[],shots:[],sparks:[],relics:[],height:0,count:0,boost:100,boosting:false,pulse:0,hp:3,invuln:0,score:0,alive:true,elapsed:0,fire:0,spawnY:-900,recording:[],lastGhostSample:-1,ghost:importedGhost||loadBestGhost()};
 intro.hidden=true;end.hidden=true;last=performance.now();raf=requestAnimationFrame(loop)}
function finish(won=false){if(!game?.alive)return;game.alive=false;cancelAnimationFrame(raf);const becameBest=saveBestGhost(game);document.querySelector('#endtag').textContent=becameBest?'NEW PERSONAL GHOST':'ASCENT RECORDED';document.querySelector('#endtitle').textContent=won?'ASCENDED':'FALLEN';document.querySelector('#endcopy').textContent=won?'ALL FOUR SEALS BROKEN. THE SPIRE IS YOURS. HEIGHT '+Math.floor(game.height)+' M · RELICS '+game.count+'.': 'HEIGHT '+Math.floor(game.height)+' M · RELICS '+game.count+'. '+(becameBest?'YOUR NEW BEST CLIMB IS SAVED AS A GHOST.':'THE SPIRE REMEMBERS.');end.hidden=false}
function burst(x,y,color,n=12){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),s=rand(40,210);game.sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.2,.6),max:.6,color})}}
function fire(){if(game.fire>0)return;game.fire=.28;game.shots.push({x:game.x,y:game.y-23,vy:-560,life:1})}
function pulse(){if(!game?.alive||game.pulse>0)return;game.pulse=4;for(const e of game.enemies){if(Math.hypot(e.x-game.x,e.y-game.y)<190){e.dead=true;burst(e.x,e.y,'#ffc66d',18)}}burst(game.x,game.y,'#ffc66d',28)}
function spawnAhead(){while(game.spawnY>game.camera-H*1.6){const y=game.spawnY;game.platforms.push(platform(y,rand(8,W-90),rand(58,96),Math.random()<.14?'moving':'solid'));if(Math.random()<.36)game.enemies.push({x:rand(30,W-30),y:y-rand(65,135),vx:rand(35,85)*(Math.random()<.5?-1:1),hp:2,dead:false,phase:rand(0,6)});if(Math.random()<.26)game.relics.push({x:rand(24,W-24),y:y-rand(25,60),taken:false,phase:rand(0,6)});game.spawnY-=rand(70,104)}}
function update(dt){const g=game;if(!g?.alive)return;g.elapsed+=dt;g.fire-=dt;g.pulse=Math.max(0,g.pulse-dt);g.invuln=Math.max(0,g.invuln-dt);g.boosting=boostHeld&&g.boost>0;if(g.boosting){g.vy-=930*dt;g.boost=Math.max(0,g.boost-42*dt)}else g.boost=Math.min(100,g.boost+18*dt);
 let steer=0;if(leftHeld&&!rightHeld)steer=-1;else if(rightHeld&&!leftHeld)steer=1;else if(pointer!==null){const delta=pointer-g.x;steer=Math.abs(delta)<10?0:Math.sign(delta)}
 const targetV=steer*540;g.vx+=(targetV-g.vx)*(1-Math.exp(-13*dt));g.vx=clamp(g.vx,-540,540);g.x+=g.vx*dt;if(g.x< -12)g.x=W+12;if(g.x>W+12)g.x=-12;
 g.vy+=900*dt;const oldY=g.y;g.y+=g.vy*dt;
 if(g.vy>0){for(const p of g.platforms){const py=p.y;if(oldY+22<=py&&g.y+22>=py&&g.x+13>p.x&&g.x-13<p.x+p.w){g.y=py-22;g.vy=-510;if(p.kind==='moving')p.used=true;burst(g.x,py,'#b58a50',4);break}}}
 if(g.boosting)burst(g.x+rand(-8,8),g.y+22,'#ffc66d',1);
 g.camera=Math.min(g.camera,g.y-H*.53);g.height=Math.max(g.height,-g.camera);g.score=Math.floor(g.height);sampleGhost(g);
 const gate=nextBoss(g.chapter);if(gate&&!g.boss&&g.height>=gate.bossAt){const hp=bossHealth(g.chapter);g.boss={x:W*.5,y:g.y-H*.28,vx:78,hp,maxHp:hp,dead:false,phase:0,isBoss:true,entrance:1.2};g.enemies.push(g.boss);burst(g.boss.x,g.boss.y,'#e0b7ff',32);}
 spawnAhead();
 for(const p of g.platforms){if(p.kind==='moving')p.x=clamp(p.x+Math.sin(g.elapsed*1.7+p.phase)*48*dt,4,W-p.w-4)}
 for(const e of g.enemies){if(e.dead)continue;e.x+=e.vx*dt;if(e.x<(e.isBoss?54:20)||e.x>W-(e.isBoss?54:20))e.vx*=-1;e.phase+=dt*3;if(e.isBoss&&e.entrance>0){e.entrance=Math.max(0,e.entrance-dt);e.y+=Math.sin(e.phase*.7)*9*dt}}
 for(const e of g.enemies){if(!e.dead&&g.invuln<=0&&Math.hypot(e.x-g.x,e.y-g.y)<(e.isBoss?52:29)){g.hp--;g.invuln=1.25;g.vy=-360;burst(g.x,g.y,'#d75b48',18);if(g.hp<=0){finish();return}}}
 for(const s of g.shots){s.y+=s.vy*dt;s.life-=dt;for(const e of g.enemies){if(!e.dead&&Math.abs(s.x-e.x)<(e.isBoss?46:20)&&Math.abs(s.y-e.y)<(e.isBoss?48:22)){e.hp--;s.life=0;burst(e.x,e.y,'#ffc66d',5);if(e.hp<=0){e.dead=true;g.score+=e.isBoss?1200:80;burst(e.x,e.y,e.isBoss?'#e0b7ff':'#b58a50',e.isBoss?54:16);if(e.isBoss){g.boss=null;g.chapter++;if(campaignComplete(g.chapter)){finish(true);return}}}break}}}
 for(const r of g.relics){r.phase+=dt*2;if(!r.taken&&Math.hypot(r.x-g.x,r.y-g.y)<27){r.taken=true;g.count++;burst(r.x,r.y,'#ffc66d',15)}}
 g.shots=g.shots.filter(s=>s.life>0&&s.y>g.camera-H-80);g.enemies=g.enemies.filter(e=>!e.dead&&e.y<g.camera+H+100);g.platforms=g.platforms.filter(p=>p.y<g.camera+H+100);g.relics=g.relics.filter(r=>!r.taken&&r.y<g.camera+H+100);
 for(const p of g.sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;p.life-=dt}g.sparks=g.sparks.filter(p=>p.life>0);
 if(g.fire<=0)fire();
 if(g.y-g.camera>H+100)finish();
 heightEl.textContent=String(Math.floor(g.height)).padStart(4,'0')+' m';if(chapterEl){const world=WORLDS[Math.min(g.chapter,3)];chapterEl.textContent=g.chapter>=4?'ASCENDED':(world.name+' · '+(world.boss&&g.boss?world.boss+' '+g.boss.hp+'/'+g.boss.maxHp:'SEAL '+(g.chapter+1)+'/4'));}relicEl.textContent=String(g.count).padStart(2,'0');armorEl.textContent='♥ '.repeat(g.hp).trim()||'—';boostBtn.style.opacity=g.boost>0?'.95':'.45';boostBtn.textContent=g.boosting?'THRUST':'JET '+Math.ceil(g.boost)+'%';blastBtn.textContent=g.pulse>0?'PULSE '+g.pulse.toFixed(1):'PULSE READY';
}
const ZONES=[{name:'GOTHIC BASTION',sky:'#17151b',deep:'#08080d',layers:['#211d27','#302631','#3a3030'],dust:'#c39a6133',platform:'#b58a50',edge:'#6f5638',enemy:'#713b39',glow:'#ffc66d'},{name:'ASHEN EXPANSE',sky:'#211a19',deep:'#0c0909',layers:['#382522','#4a3028','#58392d'],dust:'#e08b5938',platform:'#c47b52',edge:'#754632',enemy:'#a34c3c',glow:'#ffb16b'},{name:'FOUNDRY ORBIT',sky:'#101c23',deep:'#070b12',layers:['#172b35','#203944','#2a4650'],dust:'#72c5d044',platform:'#6ca9a5',edge:'#345c61',enemy:'#a35b55',glow:'#8de2d5'},{name:'THE BURIED SPIRE',sky:'#1c1728',deep:'#08070f',layers:['#28213d','#382b4b','#483653'],dust:'#b99be044',platform:'#b49bd0',edge:'#66527f',enemy:'#a65d80',glow:'#e0b7ff'}];
function draw(){const g=game;if(!g)return;const zone=ZONES[Math.min(ZONES.length-1,Math.floor(g.height/1200))];ctx.clearRect(0,0,W,H);const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,zone.sky);grad.addColorStop(1,zone.deep);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // layered parallax silhouettes: distant spires, mid-level buttresses, foreground machinery
 for(let layer=0;layer<3;layer++){const par=g.camera*(.12+layer*.16),step=layer===0?118:layer===1?174:226;ctx.fillStyle=zone.layers[layer];for(let i=-2;i<Math.ceil(W/step)+2;i++){const x=i*step+((i*37)%29),y=((i*71-par*.42)%(H+260)+H+260)%(H+260)-110;ctx.beginPath();ctx.moveTo(x,y+180);ctx.lineTo(x+8,y+70);ctx.lineTo(x+27,y+48);ctx.lineTo(x+46,y+70);ctx.lineTo(x+54,y+180);ctx.closePath();ctx.fill();ctx.fillRect(x+18,y+90,18,90)}}
 // faint amber dust
 for(let i=0;i<34;i++){const x=(i*83)%W,y=((i*127-g.camera*.28)%(H+20)+H+20)%(H+20);ctx.fillStyle=zone.dust;ctx.fillRect(x,y,1.5,1.5)}
 ctx.save();ctx.translate(0,-g.camera);
 for(const p of g.platforms){ctx.fillStyle=zone.layers[2];ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle=zone.platform;ctx.fillRect(p.x,p.y,p.w,2);ctx.fillStyle=zone.edge;ctx.fillRect(p.x+5,p.y+5,p.w-10,2);ctx.fillStyle='#474047';ctx.fillRect(p.x+9,p.y+10,4,7)}
 for(const r of g.relics){ctx.save();ctx.translate(r.x,r.y);ctx.rotate(Math.sin(r.phase)*.25);ctx.shadowBlur=18;ctx.shadowColor='#ffc66d';ctx.fillStyle='#ffc66d';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(8,0);ctx.lineTo(0,10);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.restore()}
 for(const e of g.enemies){ctx.save();ctx.translate(e.x,e.y);if(e.isBoss){ctx.rotate(Math.sin(e.phase)*.08);ctx.shadowBlur=28;ctx.shadowColor='#e0b7ff';ctx.fillStyle='#24172f';ctx.strokeStyle='#e0b7ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-42);ctx.lineTo(38,-12);ctx.lineTo(30,30);ctx.lineTo(0,45);ctx.lineTo(-30,30);ctx.lineTo(-38,-12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffc66d';ctx.fillRect(-11,-5,22,6);ctx.fillStyle='#6b4d7e';ctx.fillRect(-36,-54,72,5);ctx.fillStyle='#e0b7ff';ctx.fillRect(-36,-54,72*(e.hp/e.maxHp),5);}else{ctx.fillStyle=zone.enemy;ctx.shadowBlur=14;ctx.shadowColor='#b34c38';ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(15,0);ctx.lineTo(0,15);ctx.lineTo(-15,0);ctx.closePath();ctx.fill();ctx.fillStyle='#ffc66d';ctx.fillRect(-4,-2,8,4)}ctx.restore()}
 const rival=ghostAt(g.ghost,g.elapsed);if(rival){const gx=rival.x*W,gy=-rival.height;ctx.save();ctx.translate(gx,gy);ctx.globalAlpha=.34;ctx.fillStyle='#8de2d5';ctx.strokeStyle='#8de2d5';ctx.lineWidth=2;ctx.fillRect(-13,-5,26,23);ctx.strokeRect(-13,-5,26,23);ctx.beginPath();ctx.roundRect(-9,-25,18,19,5);ctx.fill();ctx.fillStyle='#e0fff7';ctx.fillRect(-5,-16,10,3);ctx.restore()}
 for(const s of g.shots){ctx.fillStyle='#ffc66d';ctx.shadowBlur=12;ctx.shadowColor='#ffc66d';ctx.fillRect(s.x-2,s.y-9,4,14);ctx.shadowBlur=0}
 // armored warrior silhouette, heavy shoulders, helmet, bronze plates, twin jetpack
 ctx.save();ctx.translate(g.x,g.y);ctx.globalAlpha=g.invuln>0&&Math.floor(g.elapsed*14)%2===0?.35:1;if(g.boosting){ctx.fillStyle='#ffc66d';ctx.shadowBlur=18;ctx.shadowColor='#ff9d3d';ctx.beginPath();ctx.moveTo(-8,19);ctx.lineTo(-3,42+rand(0,9));ctx.lineTo(0,23);ctx.fill();ctx.beginPath();ctx.moveTo(5,19);ctx.lineTo(10,40+rand(0,9));ctx.lineTo(13,20);ctx.fill()}
 ctx.fillStyle='#17171b';ctx.strokeStyle=g.cosmetic?.accent||'#b58a50';ctx.lineWidth=2;ctx.fillRect(-15,-7,30,27);ctx.strokeRect(-15,-7,30,27);ctx.fillStyle='#2d2926';ctx.fillRect(-22,-10,11,17);ctx.fillRect(11,-10,11,17);ctx.strokeRect(-22,-10,11,17);ctx.strokeRect(11,-10,11,17);ctx.fillStyle='#1a1a1e';ctx.beginPath();ctx.roundRect(-10,-26,20,20,5);ctx.fill();ctx.stroke();ctx.fillStyle=g.cosmetic?.glow||'#ffc66d';ctx.shadowBlur=12;ctx.shadowColor=g.cosmetic?.glow||'#ffc66d';ctx.fillRect(-6,-17,12,3);ctx.shadowBlur=0;ctx.fillStyle='#9a7445';ctx.fillRect(-5,1,10,4);ctx.fillStyle='#302923';ctx.fillRect(-13,19,9,8);ctx.fillRect(4,19,9,8);ctx.restore();
 for(const p of g.sparks){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4)}ctx.globalAlpha=1;ctx.restore();
 // boost meter
 ctx.fillStyle='#40362a';ctx.fillRect(14,H-104,W-28,4);ctx.fillStyle='#ffc66d';ctx.fillRect(14,H-104,(W-28)*(g.boost/100),4);
}
function loop(t){const dt=Math.min(.032,(t-last)/1000||.016);last=t;update(dt);draw();if(game?.alive)raf=requestAnimationFrame(loop)}
canvas.addEventListener('pointerdown',e=>{if(!game?.alive)return;e.preventDefault();pointer=e.clientX-canvas.getBoundingClientRect().left;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(pointer!==null){e.preventDefault();pointer=e.clientX-canvas.getBoundingClientRect().left}});canvas.addEventListener('pointerup',e=>{e.preventDefault();pointer=null});canvas.addEventListener('pointercancel',()=>pointer=null);
function bindHold(id,setter){const el=document.querySelector(id);el.addEventListener('pointerdown',e=>{e.preventDefault();setter(true);el.setPointerCapture(e.pointerId)});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>setter(false))}
// The control rail absorbs touches in the gaps: dead space never steers the player.
for(const type of ['pointerdown','pointermove','pointerup','pointercancel','contextmenu'])controls.addEventListener(type,e=>{e.preventDefault();e.stopPropagation()});
for(const type of ['contextmenu','selectstart','dragstart'])document.addEventListener(type,e=>e.preventDefault());
bindHold('#left',v=>leftHeld=v);bindHold('#right',v=>rightHeld=v);
boostBtn.addEventListener('pointerdown',e=>{e.preventDefault();boostHeld=true;boostBtn.setPointerCapture(e.pointerId)});boostBtn.addEventListener('pointerup',()=>boostHeld=false);boostBtn.addEventListener('pointercancel',()=>boostHeld=false);boostBtn.addEventListener('lostpointercapture',()=>boostHeld=false);blastBtn.addEventListener('click',pulse);
document.querySelector('#start').addEventListener('click',start);document.querySelector('#retry').addEventListener('click',start);

document.querySelector('#share-run').addEventListener('click',()=>{
 try{
  if(!game||game.recording.length<2)throw new Error('Complete a little more of the climb before sharing your run.');
  downloadFriendRun(createFriendRun(game));
 }catch(error){document.querySelector('#endcopy').textContent=error.message||'Unable to create friend run.'}
});
const friendFile=document.querySelector('#friend-file');
document.querySelector('#import-run').addEventListener('click',()=>friendFile.click());
friendFile.addEventListener('change',async()=>{
 try{
  importedGhost=await readFriendRun(friendFile.files?.[0]);
  document.querySelector('#intro p').textContent='FRIEND RUN LOADED · '+importedGhost.height+' M · '+importedGhost.relics+' RELICS. Begin your climb to race their translucent replay.';
  document.querySelector('#import-run').textContent='FRIEND RUN READY';
 }catch(error){document.querySelector('#intro p').textContent=error.message||'Could not load that run.'}
 finally{friendFile.value=''}
});


// Keyboard support for desktop browsers; the same game loop serves touch, mouse, and keyboard.
const heldKeys=new Set();
function keyDown(e){
 const k=e.key.toLowerCase();
 if(['arrowleft','arrowright',' ','a','d','q','e','enter'].includes(k))e.preventDefault();
 if(k==='arrowleft'||k==='a')leftHeld=true;
 if(k==='arrowright'||k==='d')rightHeld=true;
 if(k===' '||k==='shift')boostHeld=true;
 if((k==='q'||k==='e')&&!e.repeat)pulse();
 if(k==='enter'&&!game?.alive){if(!intro.hidden||!end.hidden)start()}
 heldKeys.add(k);
}
function keyUp(e){
 const k=e.key.toLowerCase();
 if(k==='arrowleft'||k==='a')leftHeld=false;
 if(k==='arrowright'||k==='d')rightHeld=false;
 if(k===' '||k==='shift')boostHeld=false;
 heldKeys.delete(k);
}
window.addEventListener('keydown',keyDown,{passive:false});
window.addEventListener('keyup',keyUp);
window.addEventListener('blur',()=>{leftHeld=false;rightHeld=false;boostHeld=false;heldKeys.clear();pointer=null});

document.addEventListener('visibilitychange',()=>{if(document.hidden){boostHeld=false;leftHeld=false;rightHeld=false;pointer=null}});
