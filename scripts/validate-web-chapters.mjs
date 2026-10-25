#!/usr/bin/env node
import {readFile,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve(process.argv[2]||'data/web-chapters');
try{
 const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
 if(manifest.format!=='portal-usfm-raw-v1'||!Array.isArray(manifest.books)||!manifest.books.length)throw Error('Invalid manifest');
 let chapters=0,verses=0,issues=0;const identifiers=new Set();
 for(const book of manifest.books){
   if(!/^[A-Z0-9]{3,4}$/.test(book.id)||identifiers.has(book.id)||!Number.isInteger(book.chapters)||book.chapters<1)throw Error('Invalid book entry');
   identifiers.add(book.id);
   for(let chapter=1;chapter<=book.chapters;chapter++){
     const path=join(root,book.id,String(chapter).padStart(3,'0')+'.json');
     const data=JSON.parse(await readFile(path,'utf8'));
     if(data.book!==book.id||data.chapter!==chapter||data.edition!=='eng-web'||data.kind!=='raw-usfm-review'||!Array.isArray(data.verses)||!data.verses.length)throw Error('Chapter mismatch: '+path);
     const unique=new Set();
     for(const verse of data.verses){
       if(typeof verse.raw_usfm!=='string'||!verse.raw_usfm.trim()||!/^\d+(?:[-,]\d+)*$/.test(String(verse.number))||unique.has(verse.number))throw Error('Missing or invalid verse: '+path+' '+verse.number);
       unique.add(verse.number);verses++;
     }
     chapters++;
   }
 }
 if(chapters!==manifest.chapters||verses!==manifest.verse_markers)throw Error('Manifest counts differ');
 console.log(JSON.stringify({status:'structure-consistent-not-editorially-approved',books:manifest.books.length,chapters,verse_markers:verses}));
}catch(error){console.error('CHAPTER VALIDATION FAILED:',error.message);process.exitCode=1}
