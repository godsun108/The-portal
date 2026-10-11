// Reusable enemy visual descriptors and pure position offsets.
// These only change rendering: no collision, spawn, speed, damage or rewards.
export const ENEMY_TYPES=Object.freeze(['sentinel','comet','wraith']);
export function enemyKind(sector,index){return ENEMY_TYPES[(Math.max(0,sector-1)+Math.max(0,index))%ENEMY_TYPES.length];}
export function enemyOffset(kind,time,seed=0){
 if(kind==='comet')return Math.sin(time/340+seed)*4;
 if(kind==='wraith')return Math.sin(time/600+seed)*6;
 return 0;
}
export function drawVariant(ctx,x,y,time,kind='sentinel',seed=0){
 const dx=enemyOffset(kind,time,seed);ctx.save();ctx.translate(x+dx,y);
 if(kind==='comet'){
  ctx.rotate(Math.sin(time/350+seed)*.15);
  ctx.fillStyle='#ffb065';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(15,10);ctx.lineTo(0,6);ctx.lineTo(-15,10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffe2a4';ctx.fillRect(-3,5,6,12+Math.sin(time/110)*3);
 }else if(kind==='wraith'){
  ctx.globalAlpha=.78+.15*Math.sin(time/310+seed);
  ctx.fillStyle='#a5a2fa';ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(19,0);ctx.lineTo(10,17);ctx.lineTo(0,10);ctx.lineTo(-10,17);ctx.lineTo(-19,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e5dfff';ctx.fillRect(-6,-2,4,3);ctx.fillRect(2,-2,4,3);
 }else{
  ctx.rotate(time/700);ctx.strokeStyle='#ff9d8d';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(19,0);ctx.lineTo(0,19);ctx.lineTo(-19,0);ctx.lineTo(0,-19);ctx.closePath();ctx.stroke();
  ctx.rotate(-time/700);ctx.fillStyle='#ef786a';ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#702c36';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
 }ctx.restore();
}
