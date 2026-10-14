import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const results=[];
for(const p of data.titles){
 const row={title:p.title,file:p.mediaFile,source:p.sourcePage,status:'unknown'};
 try{
  const api=new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action','query');api.searchParams.set('format','json');
  api.searchParams.set('prop','imageinfo');api.searchParams.set('iiprop','mime|size|url|extmetadata');
  api.searchParams.set('titles','File:'+p.mediaFile);
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  let response;try{response=await fetch(api,{headers:{'User-Agent':'PortalCinemaCatalogAudit/1.0 (GitHub Actions; non-commercial source status check)','Accept':'application/json'},signal:controller.signal})}finally{clearTimeout(timer)}
  if(!response.ok){row.status='http_'+response.status}else{
   const json=await response.json();const page=Object.values(json.query?.pages||{})[0];const info=page?.imageinfo?.[0];
   if(!info){row.status='missing_file'}else{
    row.mime=info.mime;row.bytes=info.size;row.licenseName=String(info.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]+>/g,'').slice(0,120);
    row.status=info.mime?.startsWith('video/')&&info.size>10000?'media_present':'not_video';
    row.rightsReview='Human review remains required; API metadata is not independent legal clearance.';
   }
  }
 }catch(e){row.status='check_error';row.error=String(e.message||e).slice(0,160)}
 results.push(row);
}
const report={schema:'portal.tv.classics.source-audit.v1',generatedAt:new Date().toISOString(),disclaimer:'This check tests file presence and selected metadata, not iPhone playback, availability in every country, or licensing validity.',results};
writeFileSync('cinema-source-audit.json',JSON.stringify(report,null,2)+'\n');
const present=results.filter(x=>x.status==='media_present').length;
console.log('Commons source audit: '+present+'/'+results.length+' files detected. Full report: cinema-source-audit.json');
for(const x of results)console.log(x.status.padEnd(16),x.title);
if(results.some(x=>x.status==='missing_file'||x.status==='not_video'))process.exitCode=1;
