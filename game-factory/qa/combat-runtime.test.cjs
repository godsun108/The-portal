const fs=require("fs"),path=require("path"),vm=require("vm");
const src=fs.readFileSync(path.join(__dirname,"../../games/runtime/combat.js"),"utf8").replaceAll("export ","");
const ctx={};vm.createContext(ctx);vm.runInContext(src+";this.api={clamp,health,projectile,enemy,pickup,objective,seeded,spawnField,intersects,weapons,fireWeapon,rangedEnemy,obstacle,encounter}",ctx);
const a=ctx.api;
function ok(v,m){if(!v)throw Error(m)}
const h=a.health(100);ok(h.damage(30)===70,"damage");ok(h.heal(10)===80,"heal");ok(h.damage(999)===0&&!h.alive,"death");
const p=a.projectile({x:.5,y:.5,vx:1,vy:0,speed:1});p.step(.1);ok(p.x>.59&&p.x<.61,"projectile step");
const e=a.enemy({x:0,y:0,speed:1,hp:20});e.step(.1,{x:1,y:0});ok(e.x>.09&&e.x<.11,"enemy chase");ok(e.hit(5)===15,"enemy damage");
const actor={health:a.health(50)},pick=a.pickup({type:"health",value:10});actor.health.damage(20);ok(pick.collect(actor)&&actor.health.value===40&&!pick.active,"pickup");
const o=a.objective(3);o.advance();o.advance(2);ok(o.complete&&o.progress===3,"objective");
const f1=a.spawnField({seed:42,count:4}),f2=a.spawnField({seed:42,count:4});ok(JSON.stringify(f1.map(x=>[x.x,x.y,x.speed,x.health.value]))===JSON.stringify(f2.map(x=>[x.x,x.y,x.speed,x.health.value])),"deterministic spawn");
const volley=a.fireWeapon({weapon:a.weapons.scatter,x:.5,y:.5,dx:0,dy:-1,rnd:()=>.5});ok(volley.length===5&&volley.every(x=>x.damage===6),"scatter weapon");
const re=a.rangedEnemy({x:.5,y:.1,range:1,cooldown:1});ok(re.update(.1,{x:.5,y:.8}),"ranged ready");const es=re.shoot({x:.5,y:.8});ok(es.owner==="enemy"&&re.timer===1,"enemy shot");
const wall=a.obstacle({x:.5,y:.5,w:.2,h:.2});ok(wall.contains(.5,.5)&&!wall.contains(.8,.8),"obstacle");
const enc=a.encounter([[1],[2]]);ok(enc.start()[0]===1&&!enc.complete,"encounter start");enc.clear();ok(enc.start()[0]===2,"encounter wave");enc.clear();ok(enc.complete,"encounter complete");
console.log("Combat runtime self-test passed");
