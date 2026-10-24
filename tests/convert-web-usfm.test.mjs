import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('converter preserves raw verse markers and records source hashes',async()=>{
 const root=await mkdtemp(join(tmpdir(),'web-fixture-'));
 try{
 const src=join(root,'src'),out=join(root,'out');await mkdir(src);
 await writeFile(join(src,'GEN.usfm'),"\\id GEN\n\\toc1 Genesis\n\\c 1\n\\v 1 In the \\wj beginning\\wj*.\n\\v 2 Earth\n\\c 2\n\\v 1 Thus\n");
 await writeFile(join(src,'FRT.usfm'),"\\id FRT\n\\mt1 Preface\n");
 const r=spawnSync(process.execPath,['scripts/convert-web-usfm.mjs',src,out],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 const manifest=JSON.parse(await readFile(join(out,'manifest.json'),'utf8'));
 assert.equal(manifest.books.length,1);assert.equal(manifest.books[0].title,'Genesis');assert.equal(manifest.chapters,2);assert.equal(manifest.verse_markers,3);
 assert.match(manifest.books[0].sha256,/^[a-f0-9]{64}$/);
 const chapter=JSON.parse(await readFile(join(out,'GEN','001.json'),'utf8'));
 assert.equal(chapter.verses[0].raw_usfm,'In the \\wj beginning\\wj*.');
 assert.equal(chapter.kind,'raw-usfm-review');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('converter fails closed on skipped chapters',async()=>{
 const root=await mkdtemp(join(tmpdir(),'web-fixture-'));
 try{const src=join(root,'src'),out=join(root,'out');await mkdir(src);
 await writeFile(join(src,'GEN.usfm'),"\\id GEN\n\\c 1\n\\v 1 First\n\\c 3\n\\v 1 Third\n");
 const r=spawnSync(process.execPath,['scripts/convert-web-usfm.mjs',src,out],{encoding:'utf8'});
 assert.notEqual(r.status,0);assert.match(r.stderr,/nonsequential chapter/);
 }finally{await rm(root,{recursive:true,force:true});}
});
