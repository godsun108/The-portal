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
  if(!validateAtlas(m)||m.id!==id||m.image!==`./assets/${id}.svg`)throw Error('invalid_manifest');
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
