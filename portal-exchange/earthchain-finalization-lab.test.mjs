import test from 'node:test';import assert from 'node:assert/strict';import {generateKeyPairSync,sign} from 'node:crypto';
import {createSignedGenesis,proposeBlock,accountFromPublicKey,signableTransaction} from './earthchain-signed-blocks.mjs';
import {signedVoteMessage} from './earthchain-signed-votes.mjs';import {finalizeOfflineBlock} from './earthchain-finalization-lab.mjs';import {importJournal} from './earthchain-recovery-lab.mjs';
const owner=generateKeyPairSync('ed25519'),receiver=generateKeyPairSync('ed25519'),from=accountFromPublicKey(owner.publicKey),to=accountFromPublicKey(receiver.publicKey);
const allocations={[from]:100,[to]:0};
const validators=Array.from({length:4},()=>generateKeyPairSync('ed25519'));
const validatorKeys=Object.fromEntries(validators.map((k,i)=>['v'+i,k.publicKey.export({format:'pem',type:'spki'})]));
function fixture(){
 const chain=createSignedGenesis('earthchain-lab-1',allocations);
 const tx={from,to,amount:7,nonce:'first',chainId:chain.chainId,publicKey:from};
 const signed={...tx,signature:sign(null,signableTransaction(tx),owner.privateKey).toString('hex')};
 const block=proposeBlock(chain,[signed],'v0');
 const votes=validators.slice(0,3).map((key,i)=>{const v={validator:'v'+i,chainId:chain.chainId,height:block.height,parent:block.parent,blockHash:block.hash};return {...v,signature:sign(null,signedVoteMessage(v),key.privateKey).toString('hex')}});
 return {chain,block,votes};
}
test('end-to-end signed transfer, signed quorum and journal recovery',()=>{const f=fixture(),result=finalizeOfflineBlock({...f,validatorKeys,allocations});assert.equal(result.chain.state.balances[to],7);assert.equal(result.chain.state.supply,100);assert.equal(result.quorum.approvals.length,3);assert.deepEqual(importJournal(result.journal),result.chain)});
test('cannot finalize with only two votes',()=>{const f=fixture();assert.throws(()=>finalizeOfflineBlock({...f,votes:f.votes.slice(0,2),validatorKeys,allocations}),/Insufficient signed quorum/)});
test('forged validator vote blocks finalization',()=>{const f=fixture();f.votes[0].signature='00';assert.throws(()=>finalizeOfflineBlock({...f,validatorKeys,allocations}),/Invalid validator signature/)});
test('altered block hash blocks finalization',()=>{const f=fixture();f.block.hash='bad';assert.throws(()=>finalizeOfflineBlock({...f,validatorKeys,allocations}),/does not match proposal/)});
test('conflicting historical vote blocks finalization',()=>{const f=fixture();const previousVotes=[{...f.votes[0],blockHash:'different'}];assert.throws(()=>finalizeOfflineBlock({...f,previousVotes,validatorKeys,allocations}),/equivocation/)});
