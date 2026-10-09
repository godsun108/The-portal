#!/usr/bin/env node
// Static quality gate for the EIDOLON browser studios. No external dependencies.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const files=['eidolon-native-motion/index.html','eidolon-motion-foundry/index.html'];
let failed=false;
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const moduleScript=html.match(/<script\s+type=["']module["']\s*>([\s\S]*?)<\/script>/i);
  if(!moduleScript){console.error('FAIL missing module script:',file);failed=true;continue;}
  const temp=path.join(os.tmpdir(),'eidolon-check-'+process.pid+'.mjs');
  try{
    fs.writeFileSync(temp,moduleScript[1]);
    cp.execFileSync(process.execPath,['--check',temp],{stdio:'pipe'});
    // Validate every inline classic script too: startup diagnostics must never hide syntax regressions.
    const classic=[...html.matchAll(/<script(?![^>]*\\btype=["'](?:module|importmap)["'])[^>]*>([\\s\\S]*?)<\\/script>/gi)];
    for(let i=0;i<classic.length;i++){
      fs.writeFileSync(temp,classic[i][1]);
      cp.execFileSync(process.execPath,['--check',temp],{stdio:'pipe'});
    }
    const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
    const duplicate=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
    const used=[...moduleScript[1].matchAll(/\$\(["']([^"']+)["']\)|\bel\(["']([^"']+)["']\)/g)].map(m=>m[1]||m[2]);
    const missing=[...new Set(used.filter(id=>!ids.includes(id)))];
    if(duplicate.length||missing.length){throw Error('Duplicate IDs: '+duplicate.join(', ')+'; missing referenced IDs: '+missing.join(', '));}
    console.log('PASS',file,'module + '+classic.length+' classic scripts syntax and DOM IDs');
  }catch(e){failed=true;console.error('FAIL',file,e.stderr?.toString()||e.message)}
  finally{try{fs.unlinkSync(temp)}catch{}}
}
process.exitCode=failed?1:0;
