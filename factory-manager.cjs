// Digital Factory Manager: validates the registry and publishes a compact supervisory snapshot.
const fs=require("fs");
const registry=JSON.parse(fs.readFileSync("factory-registry.json","utf8"));
if(registry.schema!=="portal.factory-registry.v1"||!Array.isArray(registry.factories))throw Error("invalid factory registry");
const allowed=new Set(["operational","partial","planned"]);
const ids=new Set();
for(const f of registry.factories){
 if(!f.id||ids.has(f.id))throw Error("factory id missing/duplicate: "+f.id);ids.add(f.id);
 if(!allowed.has(f.status))throw Error("invalid factory status: "+f.id);
 for(const key of ["inputs","outputs","qa","implementation","feeds"])if(!Array.isArray(f[key]))throw Error(f.id+" missing "+key);
 if(f.status==="operational"&&!f.implementation.length)throw Error("operational factory lacks implementation evidence: "+f.id);
}
const counts=registry.factories.reduce((a,f)=>(a[f.status]++,a),{operational:0,partial:0,planned:0});
const edges=registry.factories.flatMap(f=>f.feeds.filter(x=>ids.has(x)).map(to=>({from:f.id,to})));
const actions=registry.factories.map(f=>{
 const score=f.status==="partial"?70:f.status==="planned"?50:20;
 const conditions=[];
 if(f.status==="operational")conditions.push("producing");
 if(f.status==="partial")conditions.push("under-built");
 if(f.status==="planned")conditions.push("awaiting-implementation");
 if(!f.qa.length)conditions.push("under-tested");
 if(!f.inputs.length)conditions.push("input-undefined");
 const priority=score+(conditions.includes("under-tested")?20:0)+(conditions.includes("input-undefined")?10:0);
 const nextAction=f.status==="partial"?"Close the highest-risk missing step toward end-to-end autonomy.":f.status==="planned"?"Implement the smallest testable production path.":"Keep production healthy; expand only from measured demand or reusable output.";
 return {factoryId:f.id,status:f.status,conditions,priority,nextAction};
}).sort((a,b)=>b.priority-a.priority||a.factoryId.localeCompare(b.factoryId));
const snapshot={schema:"portal.factory-status.v2",generatedAt:new Date().toISOString(),counts,total:registry.factories.length,dependencyEdges:edges.length,management:{topPriority:actions[0]||null,actionQueue:actions},factories:registry.factories.map(f=>({id:f.id,name:f.name,domain:f.domain,status:f.status,autonomy:f.autonomy,outputs:f.outputs,revenueRole:f.revenueRole,implementationEvidence:f.implementation.length}))};
fs.writeFileSync("factory-status.json",JSON.stringify(snapshot,null,2)+"\n");
console.log("Digital Factory Manager:",snapshot.counts,"total",snapshot.total,"edges",snapshot.dependencyEdges);
