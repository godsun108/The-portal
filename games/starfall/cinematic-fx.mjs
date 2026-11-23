// Bounded visual-only event particles; no physics or persistent state.
const MAX=90,particles=[];
export function burst(x,y,color='#ffae7f',count=10){
 const n=Math.min(18,Math.max(0,count));
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n,spd=42+(i%4)*21;particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:.36+(i%3)*.08,max:.52,color});}
 if(particles.length>MAX)particles.splice(0,particles.length-MAX);
}
export function stepParticles(dt){
 if(!(dt>0))return;
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
}
export function paintParticles(ctx){
 ctx.save();for(const p of particles){ctx.globalAlpha=Math.max(0,Math.min(1,p.life/p.max));ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);}ctx.restore();
}
export function clearParticles(){particles.length=0;}
export function drawNebula(ctx,time){
 ctx.save();const pulse=.12+.035*Math.sin(time/2200);
 for(const [x,y,r,color] of [[120,160,180,'#426b9d'],[520,470,210,'#236f78']]){
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#07121d00');
  ctx.globalAlpha=pulse;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }ctx.restore();
}
export function drawGuardian(ctx,x,y,time,hp){
 const ratio=Math.max(0,Math.min(1,hp/65));
 const phase=ratio>2/3?1:ratio>1/3?2:3;
 const palette=phase===1?{core:'#865c9f',edge:'#f8c7e4',aura:'#eaa4d2'}:phase===2?{core:'#a14e79',edge:'#ffc2a5',aura:'#ff805f'}:{core:'#b44754',edge:'#ffe18a',aura:'#ffcf65'};
 ctx.save();ctx.translate(x,105);
 const beat=1+.045*Math.sin(time/240);
 ctx.scale(beat,beat);
 ctx.shadowBlur=phase===3?28:18;ctx.shadowColor=palette.aura;
 ctx.strokeStyle=palette.aura;ctx.globalAlpha=.5+.2*Math.sin(time/180);
 ctx.lineWidth=phase===3?5:3;ctx.beginPath();ctx.ellipse(0,0,76+Math.sin(time/170)*5,49+Math.cos(time/210)*4,0,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=1;ctx.fillStyle=palette.core;
 ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(-64,-18);ctx.lineTo(-52,34);ctx.lineTo(-15,18);ctx.lineTo(0,36);ctx.lineTo(15,18);ctx.lineTo(52,34);ctx.lineTo(64,-18);ctx.closePath();ctx.fill();
 ctx.strokeStyle=palette.edge;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-45,-8);ctx.lineTo(-15,5);ctx.lineTo(0,-20);ctx.lineTo(15,5);ctx.lineTo(45,-8);ctx.stroke();
 ctx.fillStyle=phase===3?'#fff1b0':'#ffe2b0';ctx.beginPath();ctx.arc(0,0,phase===3?15:12,0,Math.PI*2);ctx.fill();
 ctx.restore();
 ctx.fillStyle='#172a31';ctx.fillRect(x-50,64,100,5);
 ctx.fillStyle=palette.aura;ctx.fillRect(x-50,64,100*ratio,5);
 ctx.fillStyle='#d7e8e1';ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText('PHASE '+phase,x,57);
}
