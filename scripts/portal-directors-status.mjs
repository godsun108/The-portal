// Shared observability for PORTAL's bounded, non-publishing research workers.
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
const specs=[
 {id:'cinema-director',label:'Cinema Director',sources:[['cinema-discovery-candidates.json','count'],['cinema-review-queue.json','count'],['cinema-publication-report.json','proposed']]},
 {id:'tv-programming-director',label:'TV Programming Director',sources:[['world-tv-stream-health.json','results'],['world-tv-candidate-review.json','reviewed'],['tv-publication-gate-report.json','accepted']]}
];
const agents=specs.map(a=>({id:a.id,label:a.label,mode:'research_and_proposal_only',automaticPublicPublishing:false,metrics:Object.fromEntries(a.sources.map(([file,key])=>{if(!existsSync(file))return[file,{status:'not_run'}];try{const d=JSON.parse(readFileSync(file,'utf8'));const value=Array.isArray(d[key])?d[key].length:d[key];return[file,{status:'reported',value:value??null}]}catch(e){return[file,{status:'invalid_report',error:String(e.message).slice(0,100)}]}}))}));
writeFileSync('portal-directors-status.json',JSON.stringify({schema:'portal.directors.status.v1',generatedAt:new Date().toISOString(),agents,policy:'No automated rights assertions or public publication from discovery results.'},null,2)+'\n');
console.log(JSON.stringify(agents,null,2));
