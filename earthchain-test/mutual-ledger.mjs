// Two-person, non-monetary agreement ledger. No server, chain settlement or public consensus.
import {verifyJournal,verifyPacket,packetId,addressOf,b64,unb64,digest} from './protocol.mjs';
export const MUTUAL='earthchain.mutual-test-ledger.v1';
const bytes=x=>new TextEncoder().encode(JSON.stringify(x));
export function emptyMutual(config){return {schema:MUTUAL,journal:{schema:config.schema,config,entries:[]},acknowledgements:[]};}
const ackBytes=(config,id)=>bytes([MUTUAL,config.network,id]);
export async function verifyMutual(bundle,config,checkpoint=null){
 if(bundle?.schema!==MUTUAL || Object.keys(bundle).sort().join()!=='acknowledgements,journal,schema' || !Array.isArray(bundle.acknowledgements) || bundle.acknowledgements.length!==bundle.journal?.entries?.length)throw Error('mutual_receipts_required');
 const result=await verifyJournal(bundle.journal,config,checkpoint);
 for(let i=0;i<bundle.journal.entries.length;i++){
  const entry=bundle.journal.entries[i],ack=bundle.acknowledgements[i];
  if(!ack||Object.keys(ack).sort().join()!=='id,publicKey,signature'||ack.id!==entry.id)throw Error('invalid_peer_receipt');
  const peer=config.participants.find(a=>a!==entry.packet.message.action.actor);
  if(await addressOf(ack.publicKey)!==peer)throw Error('independent_peer_signature_required');
  const key=await crypto.subtle.importKey('spki',unb64(ack.publicKey),'Ed25519',false,['verify']);
  if(!await crypto.subtle.verify('Ed25519',key,unb64(ack.signature),ackBytes(config,entry.id)))throw Error('peer_signature_rejected');
 }
 return {...result,finality:'both_participants_signed_not_public_blockchain_finality'};
}
export async function inspectProposal(bundle,packet,config){
 const state=await verifyMutual(bundle,config);
 await verifyPacket(config,packet,state.count,state.head);
 const id=await packetId(packet),journal=structuredClone(bundle.journal);journal.entries.push({packet,id});
 await verifyJournal(journal,config);
 return {id,journal,slot:state.count,action:packet.message.action};
}
export async function acknowledge(bundle,packet,wallet,config){
 const proposal=await inspectProposal(bundle,packet,config);
 const peer=config.participants.find(a=>a!==packet.message.action.actor);
 if(wallet.address!==peer)throw Error('only_other_participant_can_acknowledge');
 const ack={id:proposal.id,publicKey:wallet.publicKey,signature:b64(await crypto.subtle.sign('Ed25519',wallet.privateKey,ackBytes(config,proposal.id)))};
 const next={schema:MUTUAL,journal:proposal.journal,acknowledgements:[...bundle.acknowledgements,ack]};
 await verifyMutual(next,config);return next;
}
export async function actionCommitment(config,count,head,action){return digest([MUTUAL,config.network,count,head,action]);}
// Persist this decision BEFORE signing/exporting. Never erase guards to resolve a conflict.
export function reserve(guards,slot,commitment){
 if(!Number.isSafeInteger(slot)||slot<0||!/^[a-f0-9]{64}$/.test(commitment))throw Error('invalid_reservation');
 if(Object.hasOwn(guards,String(slot))&&guards[slot]!==commitment)throw Error('conflicting_signature_blocked_keep_checkpoint');
 return {...guards,[slot]:commitment};
}
