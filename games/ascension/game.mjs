const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),cabinet=document.querySelector('#cabinet');
const heightEl=document.querySelector('#height'),relicEl=document.querySelector('#relics'),armorEl=document.querySelector('#armor'),intro=document.querySelector('#intro'),end=document.querySelector('#end');
const boostBtn=document.querySelector('#boost'),blastBtn=document.querySelector('#blast');
let W=360,H=640,D=1,raf=0,last=0,game=null,pointer=null,boostHeld=false,leftHeld=false,rightHeld=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
function resize(){D=Math.min(devicePixelRatio||1,2);const r=cabinet.getBoundingClientRect();W=r.width;H=r.height;canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0)}
new ResizeObserver(resize).observe(cabinet);resize();
function platform(y,x=rand(20,W-100),w=rand(62,96),kind='solid'){return{x,y,w,h:10,kind,phase:rand(0,6.28),used:false}}
function start(){cancelAnimationFrame(raf);pointer=null;boostHeld=false;leftHeld=false;rightHeld=false;const ps=[platform(H-100,W*.38,100)];for(let i=1;i<12;i++)ps.push(platform(H-100-i*78,rand(12,W-92),rand(62,98),i%7===0?'moving':'solid'));
 game={x:W*.5,y:H-142,vx:0,vy:-470,camera:0,platforms:ps,enemies:[],shots:[],sparks:[],relics:[],height:0,count:0,boost:100,boosting:false,pulse:0,hp:3,invuln:0,score:0,alive:true,elapsed:0,fire:0,spawnY:-900};
 intro.hidden=true;end.hidden=true;last=performance.now();raf=requestAnimationFrame(loop)}
function finish(){if(!game?.alive)return;game.alive=false;cancelAnimationFrame(raf);document.querySelector('#endtag').textContent='ASCENT RECORDED';document.querySelector('#endtitle').textContent='FALLEN';document.querySelector('#endcopy').textContent='HEIGHT '+Math.floor(game.height)+' M · RELICS '+game.count+'. THE SPIRE REMEMBERS.';end.hidden=false}
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
 g.camera=Math.min(g.camera,g.y-H*.53);g.height=Math.max(g.height,-g.camera);g.score=Math.floor(g.height);
 spawnAhead();
 for(const p of g.platforms){if(p.kind==='moving')p.x=clamp(p.x+Math.sin(g.elapsed*1.7+p.phase)*48*dt,4,W-p.w-4)}
 for(const e of g.enemies){if(e.dead)continue;e.x+=e.vx*dt;if(e.x<20||e.x>W-20)e.vx*=-1;e.phase+=dt*3}
 for(const e of g.enemies){if(!e.dead&&g.invuln<=0&&Math.hypot(e.x-g.x,e.y-g.y)<29){g.hp--;g.invuln=1.25;g.vy=-360;burst(g.x,g.y,'#d75b48',18);if(g.hp<=0){finish();return}}}
 for(const s of g.shots){s.y+=s.vy*dt;s.life-=dt;for(const e of g.enemies){if(!e.dead&&Math.abs(s.x-e.x)<20&&Math.abs(s.y-e.y)<22){e.hp--;s.life=0;burst(e.x,e.y,'#ffc66d',5);if(e.hp<=0){e.dead=true;g.score+=80;burst(e.x,e.y,'#b58a50',16)}break}}}
 for(const r of g.relics){r.phase+=dt*2;if(!r.taken&&Math.hypot(r.x-g.x,r.y-g.y)<27){r.taken=true;g.count++;burst(r.x,r.y,'#ffc66d',15)}}
 g.shots=g.shots.filter(s=>s.life>0&&s.y>g.camera-H-80);g.enemies=g.enemies.filter(e=>!e.dead&&e.y<g.camera+H+100);g.platforms=g.platforms.filter(p=>p.y<g.camera+H+100);g.relics=g.relics.filter(r=>!r.taken&&r.y<g.camera+H+100);
 for(const p of g.sparks){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;p.life-=dt}g.sparks=g.sparks.filter(p=>p.life>0);
 if(g.fire<=0)fire();
 if(g.y-g.camera>H+100)finish();
 heightEl.textContent=String(Math.floor(g.height)).padStart(4,'0')+' m';relicEl.textContent=String(g.count).padStart(2,'0');armorEl.textContent='♥ '.repeat(g.hp).trim()||'—';boostBtn.style.opacity=g.boost>0?'.95':'.45';boostBtn.textContent=g.boosting?'THRUST':'JET '+Math.ceil(g.boost)+'%';blastBtn.textContent=g.pulse>0?'PULSE '+g.pulse.toFixed(1):'PULSE READY';
}
function draw(){const g=game;if(!g)return;ctx.clearRect(0,0,W,H);const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#111116');grad.addColorStop(1,'#08080b');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // layered parallax silhouettes: distant spires, mid-level buttresses, foreground machinery
 for(let layer=0;layer<3;layer++){const par=g.camera*(.12+layer*.16),step=layer===0?118:layer===1?174:226;ctx.fillStyle=['#19191f','#202026','#29272a'][layer];for(let i=-2;i<Math.ceil(W/step)+2;i++){const x=i*step+((i*37)%29),y=((i*71-par*.42)%(H+260)+H+260)%(H+260)-110;ctx.beginPath();ctx.moveTo(x,y+180);ctx.lineTo(x+8,y+70);ctx.lineTo(x+27,y+48);ctx.lineTo(x+46,y+70);ctx.lineTo(x+54,y+180);ctx.closePath();ctx.fill();ctx.fillRect(x+18,y+90,18,90)}}
 // faint amber dust
 for(let i=0;i<34;i++){const x=(i*83)%W,y=((i*127-g.camera*.28)%(H+20)+H+20)%(H+20);ctx.fillStyle='#c39a6133';ctx.fillRect(x,y,1.5,1.5)}
 ctx.save();ctx.translate(0,-g.camera);
 for(const p of g.platforms){ctx.fillStyle='#29272a';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#b58a50';ctx.fillRect(p.x,p.y,p.w,2);ctx.fillStyle='#6f5638';ctx.fillRect(p.x+5,p.y+5,p.w-10,2);ctx.fillStyle='#474047';ctx.fillRect(p.x+9,p.y+10,4,7)}
 for(const r of g.relics){ctx.save();ctx.translate(r.x,r.y);ctx.rotate(Math.sin(r.phase)*.25);ctx.shadowBlur=18;ctx.shadowColor='#ffc66d';ctx.fillStyle='#ffc66d';ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(8,0);ctx.lineTo(0,10);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();ctx.restore()}
 for(const e of g.enemies){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#6e3533';ctx.shadowBlur=14;ctx.shadowColor='#b34c38';ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(15,0);ctx.lineTo(0,15);ctx.lineTo(-15,0);ctx.closePath();ctx.fill();ctx.fillStyle='#ffc66d';ctx.fillRect(-4,-2,8,4);ctx.restore()}
 for(const s of g.shots){ctx.fillStyle='#ffc66d';ctx.shadowBlur=12;ctx.shadowColor='#ffc66d';ctx.fillRect(s.x-2,s.y-9,4,14);ctx.shadowBlur=0}
 // armored warrior silhouette, heavy shoulders, helmet, bronze plates, twin jetpack
 ctx.save();ctx.translate(g.x,g.y);ctx.globalAlpha=g.invuln>0&&Math.floor(g.elapsed*14)%2===0?.35:1;if(g.boosting){ctx.fillStyle='#ffc66d';ctx.shadowBlur=18;ctx.shadowColor='#ff9d3d';ctx.beginPath();ctx.moveTo(-8,19);ctx.lineTo(-3,42+rand(0,9));ctx.lineTo(0,23);ctx.fill();ctx.beginPath();ctx.moveTo(5,19);ctx.lineTo(10,40+rand(0,9));ctx.lineTo(13,20);ctx.fill()}
 ctx.fillStyle='#17171b';ctx.strokeStyle='#b58a50';ctx.lineWidth=2;ctx.fillRect(-15,-7,30,27);ctx.strokeRect(-15,-7,30,27);ctx.fillStyle='#2d2926';ctx.fillRect(-22,-10,11,17);ctx.fillRect(11,-10,11,17);ctx.strokeRect(-22,-10,11,17);ctx.strokeRect(11,-10,11,17);ctx.fillStyle='#1a1a1e';ctx.beginPath();ctx.roundRect(-10,-26,20,20,5);ctx.fill();ctx.stroke();ctx.fillStyle='#ffc66d';ctx.shadowBlur=12;ctx.shadowColor='#ffc66d';ctx.fillRect(-6,-17,12,3);ctx.shadowBlur=0;ctx.fillStyle='#9a7445';ctx.fillRect(-5,1,10,4);ctx.fillStyle='#302923';ctx.fillRect(-13,19,9,8);ctx.fillRect(4,19,9,8);ctx.restore();
 for(const p of g.sparks){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4)}ctx.globalAlpha=1;ctx.restore();
 // boost meter
 ctx.fillStyle='#40362a';ctx.fillRect(14,H-104,W-28,4);ctx.fillStyle='#ffc66d';ctx.fillRect(14,H-104,(W-28)*(g.boost/100),4);
}
function loop(t){const dt=Math.min(.032,(t-last)/1000||.016);last=t;update(dt);draw();if(game?.alive)raf=requestAnimationFrame(loop)}
canvas.addEventListener('pointerdown',e=>{if(!game?.alive)return;e.preventDefault();pointer=e.clientX-canvas.getBoundingClientRect().left;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(pointer!==null){e.preventDefault();pointer=e.clientX-canvas.getBoundingClientRect().left}});canvas.addEventListener('pointerup',e=>{e.preventDefault();pointer=null});canvas.addEventListener('pointercancel',()=>pointer=null);
function bindHold(id,setter){const el=document.querySelector(id);el.addEventListener('pointerdown',e=>{e.preventDefault();setter(true);el.setPointerCapture(e.pointerId)});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>setter(false))}
bindHold('#left',v=>leftHeld=v);bindHold('#right',v=>rightHeld=v);
boostBtn.addEventListener('pointerdown',e=>{e.preventDefault();boostHeld=true;boostBtn.setPointerCapture(e.pointerId)});boostBtn.addEventListener('pointerup',()=>boostHeld=false);boostBtn.addEventListener('pointercancel',()=>boostHeld=false);boostBtn.addEventListener('lostpointercapture',()=>boostHeld=false);blastBtn.addEventListener('click',pulse);
document.querySelector('#start').addEventListener('click',start);document.querySelector('#retry').addEventListener('click',start);
document.addEventListener('visibilitychange',()=>{if(document.hidden){boostHeld=false;leftHeld=false;rightHeld=false;pointer=null}});
