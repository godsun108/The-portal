import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
const root=resolve(process.argv[2]||'data/web-chapters'),output=resolve(process.argv[3]||'dist/living-scriptures-review.html');
const wanted=[['GEN',1,'Genesis 1'],['PSA',23,'Psalm 23'],['JHN',3,'John 3']];
try{
 const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
 if(manifest.format!=='portal-usfm-raw-v1')throw Error('Expected reviewed source manifest');
 const passages=[];
 for(const [book,chapter,title] of wanted){
  const data=JSON.parse(await readFile(join(root,book,String(chapter).padStart(3,'0')+'.json'),'utf8'));
  if(data.book!==book||data.chapter!==chapter||data.kind!=='raw-usfm-review'||data.edition!=='eng-web'||!Array.isArray(data.verses)||data.verses.length<1)throw Error('Invalid source '+title);
  passages.push({title,data,source:'https://ebible.org/eng-web/'+book+String(chapter).padStart(2,'0')+'.htm'});
 }
 let html=await readFile('preview/living-scriptures-review.template.html','utf8');
 let formatter=await readFile('scripture-format.js','utf8');
 // Script termination is escaped even if future source contains markup.
 formatter=formatter.replace(/<\/script/gi,'<\\/script');
 const payload=JSON.stringify(passages).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 if(!html.includes('__FORMATTER_JS__')||!html.includes('__CORPUS_JSON__'))throw Error('Preview placeholders unavailable');
 html=html.replace('__FORMATTER_JS__',formatter).replace('__CORPUS_JSON__',payload);
 await mkdir(dirname(output),{recursive:true});await writeFile(output,html);
 console.log(JSON.stringify({status:'generated-offline-review-sample',passages:passages.map(x=>x.title),output,bytes:Buffer.byteLength(html),edition:'eng-web',source_sha256:manifest.source_archive_sha256}));
}catch(e){console.error(e.message);process.exitCode=1;}
