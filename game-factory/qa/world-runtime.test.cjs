const fs=require("fs"),path=require("path"),vm=require("vm");const src=fs.readFileSync(path.join(__dirname,"../../games/runtime/world.js"),"utf8").replaceAll("export ","");const ctx={};vm.createContext(ctx);vm.runInContext(src+";this.api={responseSystem,reputation,wallet,vehicle,mission,worldEventDirector}",ctx);const a=ctx.api,ok=(v,m)=>{if(!v)throw Error(m)};
const heat=a.responseSystem({decay:1});heat.add(30);ok(heat.level===2,"response level");heat.step(10,false);ok(heat.heat===20,"response decay");
const rep=a.reputation({civic:5});ok(rep.add("civic",3)===8,"reputation");
const cash=a.wallet(100);ok(cash.debit(40)&&cash.balance===60&&!cash.debit(100),"wallet");
const v=a.vehicle({speed:1});ok(v.enter(),"vehicle enter");v.drive(1,0,.1);ok(v.x>.59&&v.exit(),"vehicle drive exit");
const m=a.mission({id:"m1",title:"Test",steps:["go","return"]});ok(m.start()==="active","mission start");m.advance();ok(m.step==="return","mission step");ok(m.advance()==="complete","mission complete");
const d1=a.worldEventDirector([{id:"a"},{id:"b"}],42),d2=a.worldEventDirector([{id:"a"},{id:"b"}],42);ok(d1.pick().id===d2.pick().id,"event deterministic");console.log("World runtime self-test passed");
