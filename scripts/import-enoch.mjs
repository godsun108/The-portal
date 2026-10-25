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
// Charles edition headings vary by formatting. Require exactly one chapter for every 1..108.
// If the source is ambiguous, fail instead of silently omitting or misnumbering passages.
const headings=[...body.matchAll(/^\s*(?:CHAPTER|Chapter)\s+([IVXLCDM]+|\d+)\.?\s*$/gm)];
function roman(s){if(/^\d+$/.test(s))return Number(s);const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let n=0;for(let i=0;i<s.length;i++)n+=map[s[i]]<(map[s[i+1]]||0)?-map[s[i]]:map[s[i]];return n}
const chapters=headings.map((m,i)=>({number:roman(m[1]),text:body.slice(m.index+m[0].length,i+1<headings.length?headings[i+1].index:body.length).trim()}));
const valid=chapters.length===108&&chapters.every((c,i)=>c.number===i+1&&c.text.length>40);
if(!valid)throw Error('Chapter parsing needs editorial review: detected '+chapters.length+' headings; no text was published');
fs.mkdirSync(output,{recursive:true});
for(const c of chapters)fs.writeFileSync(path.join(output,String(c.number).padStart(3,'0')+'.json'),JSON.stringify({work:'1-enoch',chapter:c.number,translation:'R. H. Charles (1917)',source:'Project Gutenberg #77935',text:c.text},null,2)+'\n');
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({id:'1-enoch',title:'1 Enoch',chapters:108,translator:'R. H. Charles',year:1917,source:'https://www.gutenberg.org/ebooks/77935',license:'Public domain in the United States',status:'imported-unreviewed'},null,2)+'\n');
console.log('Imported all 108 chapters of 1 Enoch. Editorial review still required.');
