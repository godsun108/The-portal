/** Explicit PREPARE/COMMIT signed vote domains for offline BFT research.
 * This is not a production consensus implementation.
 */
const enc=new TextEncoder(),hex=/^[a-f0-9]{64}$/;
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export function phaseVotePayload({networkId,height,round,phase,commitment,validatorId}){
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId||'')||!Number.isSafeInteger(height)||height<1||!Number.isSafeInteger(round)||round<0||!['PREPARE','COMMIT'].includes(phase)||!hex.test(commitment)||!/^[a-zA-Z0-9_-]{1,64}$/.test(validatorId||''))throw Error('Invalid phase vote');
 return JSON.stringify(['earthchain.offline.phase-vote.v0',networkId,height,round,phase,commitment,validatorId]);
}
export async function verifyPhaseVotes({networkId,height,round,phase,votes,validators,quorum}){
 if(!Array.isArray(votes)||!Array.isArray(validators)||validators.length<4||new Set(validators.map(v=>v.id)).size!==validators.length||!Number.isSafeInteger(quorum)||quorum<=2*validators.length/3||quorum>validators.length)throw Error('Unsafe validator quorum');
 const keys=new Map(validators.map(v=>[v.id,v.publicKey])),seen=new Map(),equivocators=new Set(),invalid=[];
 for(const vote of votes){
  if(!keys.has(vote?.validatorId)){invalid.push('unknown_validator');continue}
  try{
   const payload=phaseVotePayload({networkId,height,round,phase,commitment:vote.commitment,validatorId:vote.validatorId});
   const key=await crypto.subtle.importKey('spki',bytes(keys.get(vote.validatorId)),'Ed25519',false,['verify']);
   if(!await crypto.subtle.verify('Ed25519',key,bytes(vote.signature),enc.encode(payload)))throw Error('Invalid signature');
   const old=seen.get(vote.validatorId);
   if(old&&old!==vote.commitment)equivocators.add(vote.validatorId);
   else seen.set(vote.validatorId,vote.commitment);
  }catch{invalid.push('invalid_signature')}
 }
 const counts=new Map();
 for(const [id,commitment] of seen)if(!equivocators.has(id))counts.set(commitment,(counts.get(commitment)??0)+1);
 const candidates=[...counts].filter(([,n])=>n>=quorum);
 return Object.freeze({candidate:candidates.length===1?candidates[0][0]:null,equivocators:[...equivocators].sort(),invalid,counts:Object.fromEntries(counts),phase,authenticated:true,canAssertFinality:false});
}
