#!/usr/bin/env node
// PORTAL Open Entertainment Curator
// Deterministic rights gate. Discovery may be broad; admission is intentionally strict.
const fs=require("fs");
const SOURCE="tv-open-candidates.json", OUTPUT="tv-open-library.json";
const allowedLicenses=new Set(["CC0-1.0","CC-BY-4.0","CC-BY-SA-4.0","PUBLIC-DOMAIN-US"]);
const candidates=JSON.parse(fs.readFileSync(SOURCE,"utf8"));
if(candidates.schema!=="portal.tv.open-candidates.v1"||!Array.isArray(candidates.items))throw Error("invalid candidate registry");
const seen=new Set(), admitted=[], rejected=[];
for(const raw of candidates.items){
 const x={...raw};
 const key=String(x.id||x.source||x.title||"").trim().toLowerCase();
 const reasons=[];
 if(!key)reasons.push("missing identity");
 if(seen.has(key))reasons.push("duplicate");
 seen.add(key);
 if(!x.title||!x.provider)reasons.push("missing title/provider");
 if(!x.source||!/^https:\/\//.test(x.source))reasons.push("missing HTTPS provenance");
 if(!x.rightsSource||!/^https:\/\//.test(x.rightsSource))reasons.push("missing HTTPS rights evidence");
 if(x.rightsStatus==="verified_open"){
   if(!allowedLicenses.has(x.license))reasons.push("license not admitted");
   if((x.license==="CC-BY-4.0"||x.license==="CC-BY-SA-4.0")&&!x.attribution)reasons.push("attribution required");
 } else if(x.rightsStatus==="authorized_embed"){
   if(x.type!=="youtube_embed"||!x.videoId)reasons.push("authorized embed lacks supported player identity");
 } else reasons.push("rights not verified");
 if(!["youtube_embed","direct_video"].includes(x.type))reasons.push("unsupported playback type");
 if(x.type==="youtube_embed"&&!/^[A-Za-z0-9_-]{11}$/.test(x.videoId||""))reasons.push("invalid YouTube id");
 if(x.type==="direct_video"&&(!x.url||!/^https:\/\//.test(x.url)))reasons.push("invalid direct video URL");
 if(reasons.length)rejected.push({id:x.id||null,title:x.title||null,reasons});
 else admitted.push(x);
}
const report={schema:"portal.tv.open-library.v1",generatedAt:new Date().toISOString(),policy:{allowedLicenses:[...allowedLicenses],admission:["verified_open","authorized_embed"],note:"Automated admission requires explicit rights evidence. Public availability alone is insufficient."},counts:{candidates:candidates.items.length,admitted:admitted.length,rejected:rejected.length},programs:admitted,rejected};
fs.writeFileSync(OUTPUT,JSON.stringify(report,null,2)+"\n");
console.log(`Open curator: ${admitted.length}/${candidates.items.length} admitted; ${rejected.length} rejected`);
if(rejected.length)console.log(rejected.map(x=>`REJECT ${x.title||x.id}: ${x.reasons.join(", ")}`).join("\n"));
