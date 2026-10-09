#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve('eidolon-native-motion'),catalog=JSON.parse(fs.readFileSync(path.join(root,'motion-catalog.json'),'utf8'));
if(catalog.schema_version!==1||!Array.isArray(catalog.motions))throw Error('Invalid catalog schema');
const ids=new Set(),allowedLicenses=new Set(['CC0-1.0','CC-BY-4.0','MIT','CUSTOM-APPROVED']);
for(const m of catalog.motions){
 if(!/^[a-z0-9][a-z0-9-]{1,63}$/.test(m.id||'')||ids.has(m.id))throw Error('Invalid/duplicate motion id');
 ids.add(m.id);
 if(typeof m.title!=='string'||!m.title.trim())throw Error(m.id+': missing title');
 if(!allowedLicenses.has(m.license)||typeof m.source_url!=='string'||!/^https:\/\//.test(m.source_url))throw Error(m.id+': missing verified license/source');
 if(!m.license_evidence||typeof m.license_evidence!=='string')throw Error(m.id+': missing license evidence');
 if(m.rig!=='makehuman-native-163')throw Error(m.id+': unsupported rig (retargeting not verified)');
 if(!/^assets\/motions\/[a-zA-Z0-9._-]+\.glb$/.test(m.path||''))throw Error(m.id+': invalid asset path');
 const full=path.join(root,m.path);
 if(!fs.existsSync(full))throw Error(m.id+': missing GLB');
 const b=fs.readFileSync(full);
 if(b.length<20||b.length>25*1024*1024||b.toString('ascii',0,4)!=='glTF')throw Error(m.id+': invalid/oversized GLB');
 const declared=b.readUInt32LE(8);if(declared!==b.length)throw Error(m.id+': GLB length mismatch');
 const hash=crypto.createHash('sha256').update(b).digest('hex');
 if(m.sha256!==hash)throw Error(m.id+': SHA256 mismatch');
 console.log('APPROVED',m.id,m.license,b.length+' bytes');
}
console.log('PASS catalog:',ids.size,'approved motions');
