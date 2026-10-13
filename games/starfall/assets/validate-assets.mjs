// Run: node games/starfall/assets/validate-assets.mjs
// Uses Node built-ins only; no installs, browsers, external network or secrets.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {validateAtlas} from '../sprite-atlas.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const ids=['fire-horse','solar-lion'];
let failed=0;
for(const id of ids){
 try{
  const m=JSON.parse(await readFile(join(root,id+'.json'),'utf8'));
  if(!validateAtlas(m)||m.id!==id||!['svg','png'].some(ext=>m.image===`./assets/${id}.${ext}`))throw Error('invalid_manifest');
  if(m.image.endsWith('.png')){
   const b=await readFile(join(root,id+'.png'));
   if(b.length<45||b.length>2_000_000||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('invalid_png_signature_or_size');
   if(b.readUInt32BE(8)!==13||b.toString('ascii',12,16)!=='IHDR')throw Error('invalid_png_header');
   if(b.readUInt32BE(16)!==m.frameWidth*m.frames||b.readUInt32BE(20)!==m.frameHeight)throw Error('dimension_mismatch');
   if(b[24]!==8||![2,6].includes(b[25])||b[26]!==0||b[27]!==0||b[28]!==0)throw Error('unsupported_png_format');
   console.log('PASS',id,`${m.frames} PNG frames`,`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
   continue;
  }
  const svg=await readFile(join(root,id+'.svg'),'utf8');
  const open=svg.match(/^<svg\b[^>]*>/);
  if(!open||!svg.trimEnd().endsWith('</svg>'))throw Error('invalid_svg_wrapper');
  const width=Number(open[0].match(/\bwidth="(\d+)"/)?.[1]);
  const height=Number(open[0].match(/\bheight="(\d+)"/)?.[1]);
  const view=open[0].match(/\bviewBox="0 0 (\d+) (\d+)"/);
  if(width!==m.frameWidth*m.frames||height!==m.frameHeight||!view||Number(view[1])!==width||Number(view[2])!==height)throw Error('dimension_mismatch');
  if(/<script\b|<foreignObject\b|\bon\w+\s*=|\bhref\s*=|url\s*\(/i.test(svg))throw Error('disallowed_svg_content');
  const groups=(svg.match(/<g\s+transform="translate\(/g)||[]).length;
  if(groups!==m.frames)throw Error('frame_count_mismatch');
  console.log('PASS',id,`${m.frames} frames`,`${width}x${height}`);
 }catch(e){failed++;console.error('FAIL',id,e.message);}
}
if(failed)process.exitCode=1;
