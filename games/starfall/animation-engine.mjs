// EarthPlay Animation Engine v1: deterministic, renderer-independent motion helpers.
// Pure functions permit future sprite atlases, GLB projections, and Canvas fallbacks.
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
export const easeOutCubic=t=>1-Math.pow(1-clamp(t,0,1),3);
export function frameAt(time,fps,count){
 if(!Number.isFinite(time)||!Number.isFinite(fps)||fps<=0||!Number.isInteger(count)||count<1)return 0;
 return Math.floor(Math.max(0,time)*fps/1000)%count;
}
export function bankFromDelta(dx,dt,maxRadians=.17){
 if(!Number.isFinite(dx)||!Number.isFinite(dt)||dt<=0)return 0;
 return clamp(dx/(dt*850),-1,1)*maxRadians;
}
export function bob(time,amplitude=2,periodMs=1200){
 if(!Number.isFinite(time)||periodMs<=0)return 0;
 return Math.sin(time*Math.PI*2/periodMs)*amplitude;
}
export function paintBanked(ctx,x,y,angle,paint){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);paint();ctx.restore();
}
