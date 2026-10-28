#!/usr/bin/env node
// Import the public-domain R. H. Charles (1917) translation of 1 Enoch.
// Usage: node scripts/import-enoch.mjs <Project-Gutenberg-plain-text-file> <output-dir>
// Source: https://www.gutenberg.org/ebooks/77935 (public domain in the US).
// The input must be independently downloaded and checked; never synthesize missing chapters.
import fs from 'node:fs';
import path from 'node:path';
const [, , input, output='data/extra-scriptures/1-enoch']=process.argv;
if(!input)throw Error('Provide the Gutenberg plain-text file');
const source=fs.readFileSync(input,'utf8').replace(/\r\n/g,'\n');
if(!source.includes('PROJECT GUTENBERG')||!source.toLowerCase().includes('enoch'))throw Error('Source identity check failed');
const start=source.indexOf('*** START OF THE PROJECT GUTENBERG EBOOK');
const end=source.indexOf('*** END OF THE PROJECT GUTENBERG EBOOK');
if(start<0||end<start)throw Error('Missing Gutenberg boundaries');
const body=source.slice(start,end);
// The table of contents and introduction mention chapter ranges, so anchor at the
// actual translation section. Its printed order deliberately dislocates parts of ch. 91.
const section=body.indexOf('I-XXXVI.');
if(section<0)throw Error('Main text section anchor missing');
const translation=body.slice(section);
function roman(value){
 const s=value.toUpperCase(),map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
 let n=0;
 for(let i=0;i<s.length;i++){
  if(!map[s[i]])return NaN;
  n+=map[s[i]]<(map[s[i+1]]||0)?-map[s[i]]:map[s[i]];
 }
 return n;
}
// Keep every Roman heading as a segment boundary, including editorial subheadings.
const all=[...translation.matchAll(/^[^\S\n]*([IVXLCDM]{1,8})\.[^\S\n]+(?:(\d+)\.[^\S\n]+)?/gim)];
const starts=all.filter(m=>{
 const n=roman(m[1]);if(n<1||n>108)return false;
 const rest=translation.slice(m.index+m[0].length).split('\n')[0].trim();
 if(m[2])return true;
 // Skip headings/titles such as "XCV. _Enoch's Grief_", "XCII. XCI...",
 // chapter-range captions, and the all-caps appendix title.
 if(/^[IVXLCDM]{1,8}\./i.test(rest))return false;
 if(/^\d+\s*[-–]\s*\d+\./.test(rest))return false;
 if(/^AN APPENDIX\b/.test(rest))return false;
 return true; // Some genuine chapter openings have no explicit verse 1.
});
const chapterText={};
for(const m of starts){
 const n=roman(m[1]);
 const next=all.find(candidate=>candidate.index>m.index);
 const raw=translation.slice(m.index+m[0].length,next?next.index:translation.length).trim();
 const text=(m[2]?m[2]+'. ':'')+raw;
 if(!text)continue;
 if(chapterText[n])chapterText[n]+='\n\n'+text;
 else chapterText[n]=text;
}
// Charles' printed edition places 1 Enoch 91:12-17 after chapter 93.
// Recover that explicitly headed fragment and place it between 91:11 and 91:18-19.
const fragment=translation.match(/^[^\S\n]*XCI\.[^\S\n]*12-17\.[^\n]*(?:\n|$)/im);
if(!fragment)throw Error('Could not locate the printed 1 Enoch 91:12-17 fragment');
const afterFragment=all.find(m=>m.index>fragment.index);
const fragmentText=translation.slice(fragment.index+fragment[0].length,afterFragment?afterFragment.index:translation.length).trim();
if(!fragmentText.startsWith('12.'))throw Error('The 1 Enoch 91:12-17 fragment did not begin with verse 12');
const chapter91=chapterText[91];
if(!chapter91)throw Error('Could not locate the first portion of chapter 91');
const verse18=chapter91.search(/(?:^|\n)[ \t]*18\.[ \t]+/);
if(verse18<0)throw Error('Could not locate verses 18-19 in the first chapter 91 portion');
chapterText[91]=chapter91.slice(0,verse18).trim()+'\n\n'+fragmentText+'\n\n'+chapter91.slice(verse18).trim();
const missing=Array.from({length:108},(_,i)=>i+1).filter(n=>!chapterText[n]);
if(missing.length)throw Error('Missing chapter text for: '+missing.join(', '));
const chapters=Array.from({length:108},(_,i)=>({number:i+1,text:chapterText[i+1]}));
if(chapters.some(c=>c.text.length<40))throw Error('A chapter is suspiciously short; review source before publishing');
if(!chapters[0].text.startsWith('1. The words of the blessing of Enoch'))throw Error('Chapter 1 does not start at its first verse');
if(!chapters[107].text.startsWith('1. Another book which Enoch wrote'))throw Error('Chapter 108 start differs from verified source');
fs.mkdirSync(output,{recursive:true});
for(const c of chapters)fs.writeFileSync(path.join(output,String(c.number).padStart(3,'0')+'.json'),JSON.stringify({work:'1-enoch',chapter:c.number,translation:'R. H. Charles (1917)',source:'Project Gutenberg #77935',text:c.text},null,2)+'\n');
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({id:'1-enoch',title:'1 Enoch',chapters:108,translator:'R. H. Charles',year:1917,source:'https://www.gutenberg.org/ebooks/77935',license:'Public domain in the United States',status:'imported-unreviewed',editorial_note:'The printed source dislocates 1 Enoch 91:12-17; this importer restores those verses to chapter 91 in verse order.'},null,2)+'\n');
console.log('Imported all 108 chapters of 1 Enoch. Editorial review still required.');
