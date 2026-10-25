/** Signed, domain-separated offline validator vote verification.
 * Research only: not a deployed BFT protocol or production finality.
 */
const enc=new TextEncoder();
const b64bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const HASH=/^[a-f0-9]{64}$/;
export function offlineVotePayload({networkId,height,round,commitment,validatorId}){
 if(typeof networkId!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId)||!Number.isSafeInteger(height)||height<1||!Number.isSafeInteger(round)||round<0||!HASH.test(commitment)||typeof validatorId!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(validatorId))throw Error('Invalid vote payload');
 return JSON.stringify(['earthchain.offline.signed-vote.v0',networkId,height,round,commitment,validatorId]);
}
export async function verifyOfflineSignedVotes({votes,validators,networkId,height,round,quorum}){
 if(!Array.isArray(votes)||!Array.isArray(validators)||validators.length<4||new Set(validators.map(v=>v.id)).size!==validators.length||!Number.isSafeInteger(quorum)||quorum<=validators.length*2/3||quorum>validators.length)throw Error('Invalid validator set or quorum');
 const keys=new Map(validators.map(v=>[v.id,v.publicKey])),valid=[],invalid=[],seen=new Map(),equivocators=new Set();
 for(const vote of votes){
  if(!keys.has(vote?.validatorId)){invalid.push('unknown_validator');continue}
  try{
   const payload=offlineVotePayload({...vote,networkId,height,round});
   if(typeof vote.signature!=='string'||typeof keys.get(vote.validatorId)!=='string')throw Error('missing signature');
   const key=await crypto.subtle.importKey('spki',b64bytes(keys.get(vote.validatorId)),'Ed25519',false,['verify']);
   if(!await crypto.subtle.verify('Ed25519',key,b64bytes(vote.signature),enc.encode(payload)))throw Error('invalid signature');
   const previous=seen.get(vote.validatorId);
   if(previous&&previous!==vote.commitment)equivocators.add(vote.validatorId);
   else seen.set(vote.validatorId,vote.commitment);
   valid.push(vote);
  }catch{invalid.push('invalid_signature_or_payload')}
 }
 const counts=new Map();
 for(const [id,commitment] of seen)if(!equivocators.has(id))counts.set(commitment,(counts.get(commitment)??0)+1);
 const eligible=[...counts].filter(([,n])=>n>=quorum);
 return Object.freeze({status:equivocators.size?'SIGNED_EQUIVOCATION':eligible.length===1?'SIGNED_QUORUM':'NO_SIGNED_QUORUM',candidate:eligible.length===1?eligible[0][0]:null,counts:Object.fromEntries(counts),equivocators:[...equivocators].sort(),validVotes:valid.length,invalid,canAssertConsensusFinality:false});
}
