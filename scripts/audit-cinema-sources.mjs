import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const results=[],pages=new Map();let networkStatus='ok';
const chunks=[];for(let i=0;i<data.titles.length;i+=25)chunks.push(data.titles.slice(i,i+25));
for(const chunk of chunks){
 const url=new URL('https://commons.wikimedia.org/w/api.php');
 for(const [k,v] of Object.entries({action:'query',format:'json',prop:'imageinfo',iiprop:'mime|size|extmetadata',titles:chunk.map(p=>'File:'+p.mediaFile).join('|')}))url.searchParams.set(k,v);
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
 try{
  const response=await fetch(url,{headers:{'User-Agent':'PORTALCinemaAudit/1.1 (Public domain source research)','Accept':'application/json'},signal:ctrl.signal});
  if(!response.ok)throw Error('Commons HTTP '+response.status);
  const json=await response.json();
  if(json.error)throw Error('Commons API '+String(json.error.code||'unknown'));
  if(!json.query?.pages)throw Error('Commons API omitted pages');
  for(const page of Object.values(json.query.pages))pages.set(page.title?.replace(/^File:/,'').replaceAll('_',' ').toLowerCase(),page);
 }catch(e){networkStatus='unavailable: '+String(e.message||e).slice(0,120);break}
 finally{clearTimeout(timer)}
}
for(const p of data.titles){const row={title:p.title,file:p.mediaFile,source:p.sourcePage};const page=pages.get(p.mediaFile.replaceAll('_',' ').toLowerCase());if(networkStatus!=='ok')row.status='check_unavailable';else if(!page?.imageinfo?.[0])row.status='missing_or_unresolved';else{const info=page.imageinfo[0];row.mime=info.mime;row.bytes=info.size;row.licenseName=String(info.extmetadata?.LicenseShortName?.value||'').replace(/<[^>]+>/g,'').slice(0,120);row.status=info.mime?.startsWith('video/')&&info.size>10000?'media_present':'not_video';row.bandwidthClass=info.size>2e9?'very_large_over_2gb':info.size>7e8?'large_over_700mb':'moderate';row.rightsReview='Human rights and edition review required.'}results.push(row)}
const report={schema:'portal.tv.classics.source-audit.v1',generatedAt:new Date().toISOString(),networkStatus,disclaimer:'Source presence and size only; not video playback or legal clearance. API errors are reported as unknown, never missing.',results};
writeFileSync('cinema-source-audit.json',JSON.stringify(report,null,2)+'\n');console.log('Source audit: '+results.filter(x=>x.status==='media_present').length+'/'+results.length+' files detected; '+networkStatus);for(const x of results)console.log(x.status.padEnd(23),x.title,x.bytes||'');if(results.some(x=>x.status==='not_video'||x.status==='missing_or_unresolved'))process.exitCode=1;
