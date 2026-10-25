import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createOfflineDurableStore} from './ec-offline-durable-store.node.mjs';import {persistBeforeOfflineSign,recoverOfflineSigner} from './ec-offline-write-before-sign.mjs';import {initialOfflineSafetyState} from './ec-offline-safety-snapshot.mjs';
const identity={networkId:'earthchain-test',validatorId:'v0'},vote={height:1,round:0,phase:'PREPARE',commitment:'a'.repeat(64)};
for(const stage of ['before-file-sync','before-rename','before-directory-sync']){
 test('injected '+stage+' blocks signing',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'earthchain-fault-')),path=join(dir,'state.json');let signed=false;
  try{
   const store=createOfflineDurableStore(path,{faultAt:stage});
   await assert.rejects(persistBeforeOfflineSign({state:initialOfflineSafetyState(identity),vote,saveDurably:store.saveDurably,sign:async()=>{signed=true}}),/Injected crash/);
   assert.equal(signed,false);
   if(stage==='before-directory-sync'){
    const recovered=await recoverOfflineSigner({snapshot:await createOfflineDurableStore(path).load(),...identity});
    assert.equal(recovered.signed.length,1);
   }else await assert.rejects(createOfflineDurableStore(path).load());
  }finally{await rm(dir,{recursive:true,force:true})}
 });
}
