// Fail-closed Cinema publishing gate. Generates a proposed catalog, never publishes itself.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const approvals=JSON.parse(readFileSync('cinema-publication-approvals.json','utf8'));
if(catalog.schema!=='portal.tv.classics.v1'||approvals.schema!=='portal.cinema.publication-approvals.v1'||!Array.isArray(approvals.entries))throw Error('Unexpected catalog or approvals schema');
const out=structuredClone(catalog),existing=new Set(out.titles.map(x=>String(x.mediaFile).replaceAll('_',' ').toLowerCase())),ids=new Set(out.titles.map(x=>x.id));
const failures=[],admitted=[];
for(const [index,e] of approvals.entries.entries()){
 try{
  if(!e||typeof e!=='object')throw Error('invalid entry');
  const required=['id','title','mediaFile','sourcePage','year','genre','credit','runtime','permissionSource','permissionReviewedAt','playbackCheckedAt','playbackEvidence','reviewer','qualityReviewedAt'];
  for(const key of required)if(!e[key]&&e[key]!==0)throw Error('missing '+key);
  if(e.rightsStatus!=='public_domain_us_source_documented'||e.publicationApproved!==true||e.playbackStatus!=='verified_playing')throw Error('rights, playback or approval gate not met');
  if(!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:[^\s]+$/i.test(e.sourcePage))throw Error('invalid Commons source page');
  if(!/^[\w.-]{3,90}$/.test(e.id)||ids.has(e.id))throw Error('duplicate/invalid id');
  if(typeof e.mediaFile!=='string'||!/^.{4,220}\.webm$/i.test(e.mediaFile)||e.mediaFile.includes('/')||e.mediaFile.includes('\\'))throw Error('invalid webm filename');
  const norm=e.mediaFile.replaceAll('_',' ').toLowerCase();if(existing.has(norm))throw Error('duplicate file');
  if(!Number.isInteger(e.year)||e.year<1880||e.year>new Date().getUTCFullYear())throw Error('invalid year');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(e.permissionReviewedAt)||!/^\d{4}-\d{2}-\d{2}$/.test(e.playbackCheckedAt)||!/^\d{4}-\d{2}-\d{2}$/.test(e.qualityReviewedAt))throw Error('invalid review dates');
  if(e.permissionSource.length<20||e.playbackEvidence.length<20||e.reviewer.length<2)throw Error('insufficient evidence');
  const mediaUrl='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(e.mediaFile);
  out.titles.push({id:e.id,title:e.title,year:e.year,genre:e.genre,credit:e.credit,runtime:e.runtime,format:'webm',mediaFile:e.mediaFile,mediaUrl,sourcePage:e.sourcePage,rightsStatus:e.rightsStatus,playbackStatus:'verified_playing',note:'U.S. public-domain evidence reviewed for this exact Commons file; other territories and editions require separate review.',publicationEvidence:{permissionSource:e.permissionSource,permissionReviewedAt:e.permissionReviewedAt,playbackCheckedAt:e.playbackCheckedAt,playbackEvidence:e.playbackEvidence,reviewer:e.reviewer,qualityReviewedAt:e.qualityReviewedAt}});
  ids.add(e.id);existing.add(norm);admitted.push(e.id);
 }catch(error){failures.push({index,id:e?.id||null,reason:error.message})}
}
if(failures.length){console.error(JSON.stringify({failures},null,2));process.exit(1)}
out.catalogRevision=(Number.isSafeInteger(catalog.catalogRevision)?catalog.catalogRevision:0)+(admitted.length?1:0);
const target='cinema-proposed-catalog.json';
writeFileSync(target,JSON.stringify(out,null,2)+'\n');
writeFileSync('cinema-publication-report.json',JSON.stringify({schema:'portal.cinema.publication-report.v1',admitted,existing:catalog.titles.length,proposed:out.titles.length,catalogSha256:createHash('sha256').update(JSON.stringify(out)).digest('hex'),status:admitted.length?'review_proposed_catalog_before_merging':'no_new_approvals',note:'Output is a proposed catalog artifact, NOT deployed or published.'},null,2)+'\n');
console.log('Publishing gate: '+admitted.length+' proposed additions; '+out.titles.length+' total titles; no automatic deployment');
