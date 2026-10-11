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
 ctx.save();ctx.translate(x,105);
 const beat=1+.045*Math.sin(time/240);ctx.scale(beat,beat);
 ctx.shadowBlur=15;ctx.shadowColor='#eaa4d2';
 ctx.fillStyle='#865c9f';ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(-64,-18);ctx.lineTo(-52,34);ctx.lineTo(-15,18);ctx.lineTo(0,36);ctx.lineTo(15,18);ctx.lineTo(52,34);ctx.lineTo(64,-18);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#f8c7e4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-45,-8);ctx.lineTo(-15,5);ctx.lineTo(0,-20);ctx.lineTo(15,5);ctx.lineTo(45,-8);ctx.stroke();
 ctx.fillStyle='#ffe2b0';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.fillStyle='#ffd096';ctx.fillRect(x-50,64,100*Math.max(0,hp)/65,4);
}
