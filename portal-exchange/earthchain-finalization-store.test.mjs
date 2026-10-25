import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {generateKeyPairSync,sign} from 'node:crypto';
import {createSignedGenesis,proposeBlock,accountFromPublicKey,signableTransaction} from './earthchain-signed-blocks.mjs';
import {signedVoteMessage} from './earthchain-signed-votes.mjs';
import {initializeFinalizationStore,recoverFinalizationStore,commitFinalizedBlock} from './earthchain-finalization-store.mjs';
const owner=generateKeyPairSync('ed25519'),receiver=generateKeyPairSync('ed25519'),from=accountFromPublicKey(owner.publicKey),to=accountFromPublicKey(receiver.publicKey),allocations={[from]:12,[to]:0};
const validators=Array.from({length:4},()=>generateKeyPairSync('ed25519'));
const validatorKeys=Object.fromEntries(validators.map((v,i)=>['v'+i,v.publicKey.export({format:'pem',type:'spki'})]));
function blockAndVotes(chain){
 const tx={from,to,amount:2,nonce:'first',chainId:chain.chainId,publicKey:from};
 const block=proposeBlock(chain,[{...tx,signature:sign(null,signableTransaction(tx),owner.privateKey).toString('hex')}],'v0');
 const votes=validators.slice(0,3).map((key,i)=>{const v={validator:'v'+i,chainId:chain.chainId,height:block.height,parent:block.parent,blockHash:block.hash};return {...v,signature:sign(null,signedVoteMessage(v),key.privateKey).toString('hex')}});
 return {block,votes};
}
async function withStore(fn){const dir=await mkdtemp(join(tmpdir(),'ec-final-'));try{const path=join(dir,'nested','state.json'),chain=createSignedGenesis('lab',allocations);await initializeFinalizationStore(path,chain,allocations);await fn(path,chain);}finally{await rm(dir,{recursive:true,force:true})}}
test('finalization persists and recovers after restart',()=>withStore(async(path,chain)=>{const {block,votes}=blockAndVotes(chain);const state=await commitFinalizedBlock({path,block,votes,validatorKeys,allocations});assert.equal(state.chain.state.balances[to],2);assert.deepEqual(await recoverFinalizationStore(path),state)}));
test('duplicate finalization rejected after restart',()=>withStore(async(path,chain)=>{const {block,votes}=blockAndVotes(chain);await commitFinalizedBlock({path,block,votes,validatorKeys,allocations});await assert.rejects(()=>commitFinalizedBlock({path,block,votes,validatorKeys,allocations}),/Invalid block linkage/)}));
test('insufficient quorum does not change disk state',()=>withStore(async(path,chain)=>{const before=await readFile(path,'utf8'),{block,votes}=blockAndVotes(chain);await assert.rejects(()=>commitFinalizedBlock({path,block,votes:votes.slice(0,2),validatorKeys,allocations}),/Insufficient/);assert.equal(await readFile(path,'utf8'),before)}));
test('corrupt or inconsistent journal fails closed',()=>withStore(async(path)=>{const doc=JSON.parse(await readFile(path,'utf8'));doc.finalized=[{height:1,hash:'fake'}];await writeFile(path,JSON.stringify(doc));await assert.rejects(()=>recoverFinalizationStore(path),/Finalization history mismatch/)}));
