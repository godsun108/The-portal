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
const snapshot={schema:"portal.factory-status.v1",generatedAt:new Date().toISOString(),counts,total:registry.factories.length,dependencyEdges:edges.length,factories:registry.factories.map(f=>({id:f.id,name:f.name,domain:f.domain,status:f.status,autonomy:f.autonomy,outputs:f.outputs,revenueRole:f.revenueRole,implementationEvidence:f.implementation.length}))};
fs.writeFileSync("factory-status.json",JSON.stringify(snapshot,null,2)+"\n");
console.log("Digital Factory Manager:",snapshot.counts,"total",snapshot.total,"edges",snapshot.dependencyEdges);
