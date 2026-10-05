// PORTAL TV Discovery Stager: source registry -> review queue.
// This tool never grants playback rights and never writes the admitted library.
const fs=require("fs");
const sources=JSON.parse(fs.readFileSync("tv-open-sources.json","utf8"));
const candidates=JSON.parse(fs.readFileSync("tv-open-candidates.json","utf8"));
if(sources.schema!=="portal.tv.open-sources.v1"||!Array.isArray(sources.sources))throw Error("invalid source registry");
const approved=new Map(sources.sources.filter(x=>x.status==="active").map(x=>[x.id,x]));
const queue=(candidates.items||[]).map(x=>{
 const sourceId=x.provider==="Blender Studio"?"blender-studio":null;
 const reservoir=sourceId?approved.get(sourceId):null;
 return {id:x.id,title:x.title,reservoir:sourceId,sourceApproved:!!reservoir,rightsStatus:x.rightsStatus||"candidate",rightsSource:x.rightsSource||null,readyForCurator:!!reservoir&&!!x.rightsSource&&["verified_open","authorized_embed"].includes(x.rightsStatus),note:reservoir?"Source is approved for discovery; curator still decides admission.":"No approved discovery reservoir mapped."};
});
const out={schema:"portal.tv.discovery-review.v1",generatedAt:new Date().toISOString(),policy:"Discovery is not admission. readyForCurator means evidence is present for curator review, not that playback rights were granted.",counts:{sources:approved.size,candidates:queue.length,readyForCurator:queue.filter(x=>x.readyForCurator).length},items:queue};
fs.writeFileSync("tv-open-discovery-review.json",JSON.stringify(out,null,2)+"\n");
console.log("PORTAL discovery staging:",out.counts);
