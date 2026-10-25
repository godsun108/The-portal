import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';import {createOfflineDurableStore} from './ec-offline-durable-store.node.mjs';import {initialOfflineSafetyState,exportOfflineSafetySnapshot} from './ec-offline-safety-snapshot.mjs';
const fixture=fileURLToPath(new URL('./ec-offline-process-child.fixture.mjs',import.meta.url));
function child(args){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,[fixture,...args],{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('error',reject);p.on('close',code=>resolve({code,out,err}))})}
test('two actual Node processes cannot sign conflicting offline votes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ec-multiprocess-')),path=join(dir,'safety.json'),lock=join(dir,'signer.lock');
 try{
  const store=createOfflineDurableStore(path);await store.saveDurably(await exportOfflineSafetySnapshot(initialOfflineSafetyState({networkId:'earthchain-test',validatorId:'v0'})));
  const [a,b]=await Promise.all([child([path,lock,'a'.repeat(64),'40']),child([path,lock,'b'.repeat(64),'40'])]);
  assert.equal([a,b].filter(x=>x.code===0).length,1,JSON.stringify([a,b]));
  assert.equal([a,b].filter(x=>x.code===2).length,1,JSON.stringify([a,b]));
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('subsequent independent process rejects a conflicting signed intent',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'ec-multiprocess-')),path=join(dir,'safety.json'),lock=join(dir,'signer.lock');
 try{
  await createOfflineDurableStore(path).saveDurably(await exportOfflineSafetySnapshot(initialOfflineSafetyState({networkId:'earthchain-test',validatorId:'v0'})));
  const a=await child([path,lock,'a'.repeat(64)]),b=await child([path,lock,'b'.repeat(64)]);
  assert.equal(a.code,0,JSON.stringify(a));assert.equal(b.code,2,JSON.stringify(b));
 }finally{await rm(dir,{recursive:true,force:true})}
});
