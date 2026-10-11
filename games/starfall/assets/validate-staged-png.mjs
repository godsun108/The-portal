// Validate a staged PNG sprite atlas using only Node built-ins.
// PNG CRC and decode are intentionally left to browser validation; header dimensions are checked here.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {validateAtlas} from '../sprite-atlas.mjs';
const id=process.argv[2];
if(!['fire-horse','solar-lion'].includes(id))throw Error('unsupported_hull');
const dir=join(dirname(fileURLToPath(import.meta.url)),'staging');
const m=JSON.parse(await readFile(join(dir,id+'.json'),'utf8'));
if(!validateAtlas(m)||m.id!==id||m.image!==`./assets/${id}.png`)throw Error('invalid_manifest');
const b=await readFile(join(dir,id+'.png'));
if(b.length<45||b.length>2_000_000||!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('invalid_png_signature_or_size');
if(b.toString('ascii',12,16)!=='IHDR'||b.readUInt32BE(8)!==13)throw Error('invalid_ihdr');
if(b.readUInt32BE(16)!==m.frameWidth*m.frames||b.readUInt32BE(20)!==m.frameHeight)throw Error('dimension_mismatch');
if(b[26]!==0||![2,6].includes(b[25])||b[24]!==8)throw Error('unsupported_png_format');
console.log('PASS staged PNG header',id);
