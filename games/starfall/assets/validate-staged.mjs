// Validate a staged atlas against the existing runtime contract before publication.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {validateAtlas} from '../sprite-atlas.mjs';
const id=process.argv[2],root=dirname(fileURLToPath(import.meta.url));
if(!['fire-horse','solar-lion'].includes(id))throw Error('unsupported_hull');
const dir=join(root,'staging');
const m=JSON.parse(await readFile(join(dir,id+'.json'),'utf8'));
if(!validateAtlas(m)||m.id!==id||m.image!==`./assets/${id}.svg`)throw Error('invalid_manifest');
const svg=await readFile(join(dir,id+'.svg'),'utf8');
const open=svg.match(/^<svg\b[^>]*>/);
const w=Number(open?.[0].match(/\bwidth="(\d+)"/)?.[1]),h=Number(open?.[0].match(/\bheight="(\d+)"/)?.[1]);
const view=open?.[0].match(/\bviewBox="0 0 (\d+) (\d+)"/);
if(!open||!svg.trimEnd().endsWith('</svg>')||w!==m.frameWidth*m.frames||h!==m.frameHeight||!view||Number(view[1])!==w||Number(view[2])!==h)throw Error('dimension_mismatch');
if(/<script\b|<foreignObject\b|\bon\w+\s*=|\bhref\s*=|url\s*\(/i.test(svg))throw Error('active_svg_content');
if((svg.match(/<g\s+transform="translate\(/g)||[]).length!==m.frames)throw Error('frame_count_mismatch');
console.log('PASS staged',id);
