export function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
export function health(max=100){let value=max;return{get value(){return value},get max(){return max},damage(n){value=clamp(value-Math.max(0,n),0,max);return value},heal(n){value=clamp(value+Math.max(0,n),0,max);return value},get alive(){return value>0}}}
export function projectile({x=0,y=0,vx=0,vy=-1,speed=.8,damage=10,owner="player"}={}){const m=Math.hypot(vx,vy)||1;return{x,y,vx:vx/m*speed,vy:vy/m*speed,damage,owner,alive:true,step(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;if(this.x<-.1||this.x>1.1||this.y<-.1||this.y>1.1)this.alive=false}}}
export function enemy({x=.5,y=.1,speed=.12,hp=20,kind="chaser"}={}){const h=health(hp);return{x,y,speed,kind,health:h,step(dt,target){const dx=target.x-this.x,dy=target.y-this.y,m=Math.hypot(dx,dy)||1;this.x+=dx/m*this.speed*dt;this.y+=dy/m*this.speed*dt},hit(damage){return h.damage(damage)}}}
export function pickup({x=.5,y=.5,type="health",value=20}={}){return{x,y,type,value,active:true,collect(actor){if(!this.active)return false;this.active=false;if(type==="health"&&actor.health)actor.health.heal(value);return true}}}
export function objective(target=1){let progress=0;return{get progress(){return progress},get target(){return target},get complete(){return progress>=target},advance(n=1){progress=clamp(progress+n,0,target);return progress}}}
export function seeded(seed=1){let s=(seed>>>0)||1;return()=>((s=Math.imul(1664525,s)+1013904223>>>0)/4294967296)}
export function spawnField({seed=1,count=5,kind="chaser"}={}){const rnd=seeded(seed),out=[];for(let i=0;i<count;i++)out.push(enemy({x:.08+rnd()*.84,y:.05+rnd()*.25,speed:.08+rnd()*.08,hp:15+Math.floor(rnd()*16),kind}));return out}
export function intersects(a,b,r=.035){return Math.hypot(a.x-b.x,a.y-b.y)<=r}

export const weapons={
 pulse:{id:"pulse",damage:10,speed:1.05,cooldown:.16,pellets:1,spread:0},
 scatter:{id:"scatter",damage:6,speed:.88,cooldown:.62,pellets:5,spread:.22},
 lance:{id:"lance",damage:28,speed:1.35,cooldown:.8,pellets:1,spread:0}
}
export function fireWeapon({weapon=weapons.pulse,x=.5,y=.5,dx=0,dy=-1,rnd=Math.random}={}){const out=[];for(let i=0;i<weapon.pellets;i++){const angle=(rnd()-.5)*weapon.spread,c=Math.cos(angle),s=Math.sin(angle),vx=dx*c-dy*s,vy=dx*s+dy*c;out.push(projectile({x,y,vx,vy,speed:weapon.speed,damage:weapon.damage}))}return out}
export function rangedEnemy({x=.5,y=.1,speed=.08,hp=25,range=.32,cooldown=1.4}={}){const e=enemy({x,y,speed,hp,kind:"ranged"});e.range=range;e.cooldown=cooldown;e.timer=0;e.update=function(dt,target){const dx=target.x-this.x,dy=target.y-this.y,d=Math.hypot(dx,dy)||1;this.timer=Math.max(0,this.timer-dt);if(d>this.range){this.x+=dx/d*this.speed*dt;this.y+=dy/d*this.speed*dt}return d<=this.range&&this.timer<=0};e.shoot=function(target){this.timer=this.cooldown;return projectile({x:this.x,y:this.y,vx:target.x-this.x,vy:target.y-this.y,speed:.42,damage:9,owner:"enemy"})};return e}
export function obstacle({x=.5,y=.5,w=.12,h=.05}={}){return{x,y,w,h,contains(px,py){return px>=x-w/2&&px<=x+w/2&&py>=y-h/2&&py<=y+h/2}}}
export function encounter(waves=[]){let index=0,active=false;return{get index(){return index},get complete(){return index>=waves.length},get active(){return active},start(){if(this.complete)return null;active=true;return waves[index]},clear(){if(active){index++;active=false}return this.complete}}}
