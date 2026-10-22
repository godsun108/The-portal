// Publication gate: only previously authorized and device-verified entries are eligible.
// Never treat network probes, iptv-org listing or source labels as authorization.
import {readFileSync,writeFileSync} from 'node:fs';
const approvals=JSON.parse(readFileSync('tv-publication-approvals.json','utf8'));
if(approvals.schema!=='portal.tv.publication-approvals.v1'||!Array.isArray(approvals.entries))throw Error('Invalid approvals');
const valid=[],rejected=[],seen=new Set();
for(const x of approvals.entries){const reason=[];if(!x.id||!x.name||!x.url)reason.push('metadata_missing');if(seen.has(x.id))reason.push('duplicate_id');seen.add(x.id);let u;try{u=new URL(x.url);if(u.protocol!=='https:'||u.username||u.password)reason.push('invalid_url')}catch{reason.push('invalid_url')}if(x.rightsStatus!=='authorized_for_portal_embed'||!x.permissionSource||!x.permissionReviewedAt)reason.push('authorization_missing');
if(x.permissionReviewedAt&&(!/^\\d{4}-\\d{2}-\\d{2}/.test(x.permissionReviewedAt)))reason.push('invalid_permission_date');if(x.playbackStatus!=='user_confirmed_playing'||!x.playbackCheckedAt)reason.push('playback_missing');(reason.length?rejected:valid).push(reason.length?{id:x.id,reason}:x)}
writeFileSync('tv-publication-gate-report.json',JSON.stringify({schema:'portal.tv.publication-gate-report.v1',accepted:valid.length,rejected,disclaimer:'Requires manually documented authorization; not a legal determination.'},null,2)+'\n');
if(rejected.length)throw Error('Publication gate rejected '+rejected.length+' entries');
writeFileSync('tv-authorized-channels.json',JSON.stringify({schema:'portal.tv.authorized-channels.v1',generatedAt:new Date().toISOString(),channels:valid},null,2)+'\n');
console.log('Authorized publication entries:',valid.length);
