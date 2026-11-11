export function bossAttackCadence(chapter,phase=0){const base=1.65-Math.max(0,chapter)*.13;return Math.max(.62,base*(phase?0.68:1));}
export function bossVolley(chapter,phase,x,y,targetX,targetY){const aim=Math.atan2(targetY-y,targetX-x),fan=phase?[-.48,-.24,0,.24,.48]:[-.3,0,.3],speed=250+Math.max(0,chapter)*24;return fan.map(offset=>({vx:Math.cos(aim+offset)*speed,vy:Math.sin(aim+offset)*speed,life:4,kind:'boss'}));}
export function applyPickupEffect(type,state){const next={hp:state.hp,boost:state.boost,pulse:state.pulse,shield:state.shield||0};if(type==='repair')next.hp=Math.min(3,next.hp+1);else if(type==='boost')next.boost=Math.min(100,next.boost+45);else if(type==='pulse')next.pulse=0;else if(type==='shield')next.shield=Math.max(next.shield,8);return next;}

export function pulseDamage(currentHp,isBoss=false){return isBoss?Math.min(6,currentHp):currentHp;}
