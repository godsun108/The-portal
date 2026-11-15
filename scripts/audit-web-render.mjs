import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import vm from 'node:vm';
const root=resolve(process.argv[2]||'data/web-chapters');
try{
 const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
 const context={};vm.runInNewContext(await readFile('scripture-format.js','utf8'),context);
 const project=context.ScriptureFormat.projectUSFM;
 if(typeof project!=='function')throw Error('Formatter not found');
 let total=0,unresolved=0,blank=0,notes=0,heading=0;
 const samples=[],unresolvedTags={};
 for(const book of manifest.books)for(let n=1;n<=book.chapters;n++){
  const chapter=JSON.parse(await readFile(join(root,book.id,String(n).padStart(3,'0')+'.json'),'utf8'));
  for(const verse of chapter.verses){
   total++;
   const result=project(verse.raw_usfm);
   if(!result.text.trim())blank++;
   notes+=result.notes.length;
   if(/\\(?:s\\d*|ms\\d*|mr|r)\b/.test(verse.raw_usfm))heading++;
   if(result.has_unresolved_markup){
    unresolved++;
    for(const x of result.text.matchAll(/\\([+a-zA-Z][\w]*)/g))unresolvedTags[x[1]]=(unresolvedTags[x[1]]||0)+1;
    if(samples.length<15)samples.push({book:book.id,chapter:n,verse:verse.number,preview:result.text.slice(0,180)});
   }
  }
 }
 const report={status:unresolved===0&&blank===0?'projection-markup-clean-not-editorially-certified':'editorial-review-required',verse_markers:total,unresolved_verse_markers:unresolved,blank_projected_verses:blank,footnotes:notes,source_heading_markers:heading,top_unresolved_tags:Object.entries(unresolvedTags).sort((a,b)=>b[1]-a[1]).slice(0,20),samples};
 console.log(JSON.stringify(report,null,2));
 if(total!==manifest.verse_markers)throw Error('Audit coverage inconsistent with source manifest');
}catch(err){console.error('Rendering audit failed:',err.message);process.exitCode=1;}
