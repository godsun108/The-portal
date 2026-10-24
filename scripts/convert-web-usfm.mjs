#!/usr/bin/env node
// Conservative, provenance-preserving USFM -> chapter JSON converter.
// Experimental output is a review artifact, not a certified edition.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
const [,, input, output] = process.argv;
if (!input || !output) { console.error('Usage: node scripts/convert-web-usfm.mjs <extracted-usfm-dir> <output-dir>'); process.exit(2); }
const peripherals = new Set(['FRT','INT','GLO','BAK','CNC','TDX','NDX']);
const sha = data => createHash('sha256').update(data).digest('hex');
async function walk(dir) {
  const entries = await readdir(dir,{withFileTypes:true});
  const paths = [];
  for(const x of entries){const p=join(dir,x.name);if(x.isDirectory())paths.push(...await walk(p));else if(x.isFile() && /\.(usfm|sfm)$/i.test(x.name))paths.push(p);}
  return paths.sort();
}
function parseUsfm(raw, path) {
  const id = raw.match(/^\\id\s+([A-Z0-9]{3,4})\b/m)?.[1];
  if (!id) throw Error(path+': invalid book id');
  if(peripherals.has(id))return null;
  const title=(raw.match(/^\\toc1\s+(.+)$/m)?.[1]||raw.match(/^\\h\s+(.+)$/m)?.[1]||id).trim();
  const chapters = []; let chapter=null, verse=null;
  // Keep original verse material exactly, including all USFM formatting markers.
  for(const line of raw.split(/\r?\n/)) {
    const ch=line.match(/^\\c\s+(\d+)\s*$/);
    const v=line.match(/^\\v\s+(\d+(?:[-,]\d+)*)\s*(.*)$/);
    if(ch) {
      const no=Number(ch[1]);
      if(no!==chapters.length+1)throw Error(path+': nonsequential chapter '+no);
      chapter={chapter:no,verses:[]};chapters.push(chapter);verse=null;
    } else if(v) {
      if(!chapter)throw Error(path+': verse before chapter');
      if(verse)verse.raw_usfm=verse.raw_usfm.trimEnd();
      verse={number:v[1],raw_usfm:v[2]};
      chapter.verses.push(verse);
    } else if (verse) {
      // Preserve interspersed section headings / paragraph markers for editorial review.
      verse.raw_usfm+='\n'+line;
    }
  }
  if (!chapters.length || chapters.some(c=>!c.verses.length)) throw Error(path+': missing chapter verses');
  return {id,title,chapters};
}
try {
  const inputRoot=resolve(input),outRoot=resolve(output);const paths=await walk(inputRoot);
  if(!paths.length)throw Error('No USFM source files');
  const manifest={format:'portal-usfm-raw-v1',source:'World English Bible via https://ebible.org/Scriptures/eng-web_usfm.zip',validation:'structural-only; requires manual formatting review',source_archive_sha256:'1298c07ccd62fe8ebab6d0cc94ab75a88dd95272d7fe618faeb7a8f6d632c6e0',books:[],chapters:0,verse_markers:0};
  const ids=new Set();
  for(const path of paths) {
    const bytes=await readFile(path);const parsed=parseUsfm(bytes.toString('utf8'),path);
    if(!parsed)continue;
    if(ids.has(parsed.id))throw Error('Duplicate id '+parsed.id);
    ids.add(parsed.id);
    const target=join(outRoot,parsed.id);await mkdir(target,{recursive:true});
    for(const c of parsed.chapters) {
      const name=String(c.chapter).padStart(3,'0')+'.json';
      await writeFile(join(target,name),JSON.stringify({edition:'eng-web',book:parsed.id,chapter:c.chapter,verses:c.verses,kind:'raw-usfm-review'},null,0)+'\n');
      manifest.verse_markers+=c.verses.length;manifest.chapters++;
    }
    manifest.books.push({id:parsed.id,title:parsed.title,chapters:parsed.chapters.length,sha256:sha(bytes),source_file:basename(path)});
  }
  if(!manifest.books.length)throw Error('No canonical scripture book source files');
  await mkdir(outRoot,{recursive:true});
  await writeFile(join(outRoot,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({books:manifest.books.length,chapters:manifest.chapters,verse_markers:manifest.verse_markers,format:manifest.format}));
} catch(e){console.error('CONVERSION FAILED:',e.message);process.exitCode=1;}
