import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve('.'),dir=mkdtempSync(join(tmpdir(),'portal-cinema-gate-'));
try{
 const original=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
 writeFileSync(join(dir,'tv-cinema-classics.json'),JSON.stringify(original));
 const manifest={schema:'portal.cinema.publication-approvals.v1',entries:[]};
 const run=()=>spawnSync(process.execPath,[join(root,'scripts/build-cinema-publication-proposal.mjs')],{cwd:dir,encoding:'utf8'});
 const save=()=>writeFileSync(join(dir,'cinema-publication-approvals.json'),JSON.stringify(manifest));
 save();let r=run();assert.equal(r.status,0,r.stderr);
 assert.equal(JSON.parse(readFileSync(join(dir,'cinema-proposed-catalog.json','utf8'))).titles.length,original.titles.length);
 manifest.entries=[{id:'test-film',title:'Test Film',mediaFile:'Test Film.webm',sourcePage:'https://commons.wikimedia.org/wiki/File:Test_Film.webm',year:1925,genre:'Drama',credit:'Test',runtime:'2 min',permissionSource:'Specific Commons file page rights evidence',permissionReviewedAt:'2026-10-22',playbackCheckedAt:'2026-10-22',playbackEvidence:'Recorded player playback on supported test device',reviewer:'reviewer',qualityReviewedAt:'2026-10-22',rightsStatus:'unverified',playbackStatus:'verified_playing',publicationApproved:true}];
 save();r=run();assert.notEqual(r.status,0,'unverified rights must fail');
 manifest.entries[0].rightsStatus='public_domain_us_source_documented';manifest.entries[0].playbackStatus='untested';
 save();r=run();assert.notEqual(r.status,0,'untested playback must fail');
 manifest.entries[0].playbackStatus='verified_playing';manifest.entries[0].publicationApproved=false;
 save();r=run();assert.notEqual(r.status,0,'unapproved candidate must fail');
 manifest.entries[0].publicationApproved=true;save();r=run();assert.equal(r.status,0,r.stderr);
 assert.equal(JSON.parse(readFileSync(join(dir,'cinema-proposed-catalog.json','utf8'))).titles.length,original.titles.length+1);
 console.log('Cinema publication gate negative and positive tests passed');
}finally{rmSync(dir,{recursive:true,force:true})}
