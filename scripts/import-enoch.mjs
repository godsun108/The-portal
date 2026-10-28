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
// Anchor at the translation's main text so introductory citations are excluded.
const section=body.indexOf('I-XXXVI.');
if(section<0)throw Error('Main text section anchor missing');
const title=body.lastIndexOf('THE BOOK OF ENOCH',section);
if(title<0)throw Error('Translation title anchor missing');
const translation=body.slice(section);
// Gutenberg uses both uppercase and lowercase Roman chapter headings.
function roman(value){
 const s=value.toUpperCase(),map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
 let n=0;
 for(let i=0;i<s.length;i++){
  if(!map[s[i]])return NaN;
  n+=map[s[i]]<(map[s[i+1]]||0)?-map[s[i]]:map[s[i]];
 }
 return n;
}
const candidates=[...translation.matchAll(/^[^\S\n]*([IVXLCDM]{1,8})\.[^\S\n]+(?:(1)\.[^\S\n]+)?/gim)];
console.log('Roman headings near source end:',candidates.slice(-30).map(m=>({label:m[1],value:roman(m[1]),line:translation.slice(m.index,m.index+90).split('\n')[0]})));
const headings=[];let expected=1;
for(const m of candidates){
 if(roman(m[1])===expected){
  headings.push(m);expected++;
  if(expected===109)break;
 }
}
if(headings.length!==108)throw Error('Found only '+headings.length+' sequential chapter starts; review source before publishing');
const chapters=headings.map((m,i)=>{
 const bodyStart=m.index+m[0].length;
 const raw=translation.slice(bodyStart,i+1<headings.length?headings[i+1].index:translation.length).trim();
 const text=(m[2]?'1. ':'')+raw;
 return {number:i+1,text};
});
if(chapters.some(c=>c.text.length<40))throw Error('A chapter is suspiciously short; review source before publishing');
if(!chapters[0].text.startsWith('1. The words of the blessing of Enoch'))throw Error('Chapter 1 does not start at its first verse');
if(!chapters[107].text.startsWith('1. Another book which Enoch wrote'))throw Error('Chapter 108 start differs from verified source');
fs.mkdirSync(output,{recursive:true});
for(const c of chapters)fs.writeFileSync(path.join(output,String(c.number).padStart(3,'0')+'.json'),JSON.stringify({work:'1-enoch',chapter:c.number,translation:'R. H. Charles (1917)',source:'Project Gutenberg #77935',text:c.text},null,2)+'\n');
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({id:'1-enoch',title:'1 Enoch',chapters:108,translator:'R. H. Charles',year:1917,source:'https://www.gutenberg.org/ebooks/77935',license:'Public domain in the United States',status:'imported-unreviewed'},null,2)+'\n');
console.log('Imported all 108 chapters of 1 Enoch. Editorial review still required.');
