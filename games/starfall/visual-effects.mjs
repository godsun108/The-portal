// Bounded, deterministic canvas-only visual enhancements.
// No wallet, collision, scoring, or persistent state changes.
export function drawThrusters(ctx,x,y,time,hull){
 if(hull!=='fire-horse'&&hull!=='solar-lion')return;
 const fire=hull==='fire-horse',wave=Math.sin(time/95)*4;
 ctx.save();ctx.globalAlpha=.62;ctx.fillStyle=fire?'#ff8048':'#f9d774';
 for(const dx of [-11,11]){
  ctx.beginPath();ctx.moveTo(x+dx-4,y+20);ctx.lineTo(x+dx,y+38+wave);ctx.lineTo(x+dx+4,y+20);ctx.closePath();ctx.fill();
 }
 ctx.globalAlpha=.8;ctx.fillStyle=fire?'#ffd09a':'#fff5bc';
 for(const dx of [-11,11]){ctx.fillRect(x+dx-1,y+21,2,9+wave);}
 ctx.restore();
}
export function drawEnemy(ctx,x,y,time){
 const spin=time/700,outer=19;
 ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.strokeStyle='#ff9d8d';ctx.lineWidth=2;
 ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;const px=Math.cos(a)*outer,py=Math.sin(a)*outer;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.stroke();
 ctx.rotate(-spin);ctx.fillStyle='#ef786a';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#702c36';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function drawShield(ctx,x,y,time){
 const phase=(time%700)/700;ctx.save();ctx.strokeStyle='#d7fff2';ctx.globalAlpha=.65*(1-phase);ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(x,y,25+phase*17,0,Math.PI*2);ctx.stroke();ctx.restore();
}
