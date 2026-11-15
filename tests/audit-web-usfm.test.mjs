import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const audit = 'scripts/audit-web-usfm.mjs';
test('USFM audit accepts sequential chapters and emits checksum', async () => {
  const dir = await mkdtemp(join(tmpdir(),'scriptures-'));
  try {
    await writeFile(join(dir,'01-GEN.usfm'), String.raw`\id GEN
\c 1
\v 1 In the beginning
\v 2 The earth
\c 2
\v 1 Thus the heavens
`);
    const run=spawnSync(process.execPath,[audit,dir],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    const report=JSON.parse(run.stdout);
    assert.equal(report.files,1);
    assert.equal(report.chapters,2);
    assert.equal(report.verse_markers,3);
    assert.match(report.books[0].sha256,/^[a-f0-9]{64}$/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('USFM audit rejects missing chapter sequence', async () => {
  const dir = await mkdtemp(join(tmpdir(),'scriptures-'));
  try {
    await writeFile(join(dir,'GEN.usfm'), String.raw`\id GEN
\c 1
\v 1 text
\c 3
\v 1 text
`);
    const run=spawnSync(process.execPath,[audit,dir],{encoding:'utf8'});
    assert.notEqual(run.status,0);
    assert.match(run.stderr,/chapters must be consecutive/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
