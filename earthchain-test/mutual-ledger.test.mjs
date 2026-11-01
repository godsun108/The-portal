import test from 'node:test';
import assert from 'node:assert/strict';
import {addressOf,b64} from './protocol.mjs';
import {emptyMutual,acknowledge,verifyMutual,reserve} from './mutual-ledger.mjs';
import {signAction} from './wallet-crypto.mjs';

async function participant(){
  const pair=await crypto.subtle.generateKey('Ed25519',true,['sign','verify']);
  const publicKey=b64(await crypto.subtle.exportKey('spki',pair.publicKey));
  return {address:await addressOf(publicKey),publicKey,privateKey:pair.privateKey};
}
async function fixture(){
  const alice=await participant(),bob=await participant();
  const config={schema:'earthchain.first-exchange.v1',network:'EARTHCHAIN_TEST_0123456789abcdef0123456789abcdef',asset:'ECTEST',fee:0,participants:[alice.address,bob.address]};
  const bundle=emptyMutual(config);
  const state={network:config.network,count:0,head:null};
  const packet=await signAction(alice,config,state,{type:'FAUCET',actor:alice.address,to:alice.address,amount:100,at:1});
  return {alice,bob,config,bundle,packet};
}

test('two independent participants must sign the same ledger entry',async()=>{
  const {bob,config,bundle,packet}=await fixture();
  const settled=await acknowledge(bundle,packet,bob,config);
  const state=await verifyMutual(settled,config);
  assert.equal(state.count,1);
  assert.equal(state.balances[config.participants[0]],100);
  assert.equal(state.finality,'both_participants_signed_not_public_blockchain_finality');
});

test('rejects unsigned proposals and tampered peer receipts',async()=>{
  const {bob,config,bundle,packet}=await fixture();
  const unsigned={...bundle,journal:{...bundle.journal,entries:[{packet,id:'0'.repeat(64)}]}};
  await assert.rejects(()=>verifyMutual(unsigned,config),/mutual_receipts_required/);
  const settled=await acknowledge(bundle,packet,bob,config);
  const tampered=structuredClone(settled);
  tampered.acknowledgements[0].signature=tampered.acknowledgements[0].signature.slice(0,-4)+'AAAA';
  await assert.rejects(()=>verifyMutual(tampered,config));
});

test('rejects a stale checkpoint and conflicting signature reservations',async()=>{
  const {bob,config,bundle,packet}=await fixture();
  const settled=await acknowledge(bundle,packet,bob,config);
  await assert.rejects(()=>verifyMutual(settled,config,{count:1,head:'0'.repeat(64)}),/rollback_or_fork_detected/);
  const commitment='a'.repeat(64);
  const first=reserve({},0,commitment);
  assert.deepEqual(reserve(first,0,commitment),first);
  assert.throws(()=>reserve(first,0,'b'.repeat(64)),/conflicting_signature_blocked_keep_checkpoint/);
});
