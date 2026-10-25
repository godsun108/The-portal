/** Deterministic offline Byzantine vote-round simulator.
 * A safety experiment, not a consensus protocol, network, or finality proof.
 */
const HEX=/^[a-f0-9]{64}$/;
export function simulateOfflineVoteRound({validatorIds,proposals,votes,quorum}){
 if(!Array.isArray(validatorIds)||validatorIds.length<4||new Set(validatorIds).size!==validatorIds.length||validatorIds.some(id=>typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(id)))throw Error('Invalid validator set');
 if(!Number.isSafeInteger(quorum)||quorum<=validatorIds.length*2/3||quorum>validatorIds.length)throw Error('Unsafe quorum');
 if(!Array.isArray(proposals)||!Array.isArray(votes))throw Error('Invalid round');
 const known=new Set(validatorIds),blocks=new Set();
 for(const p of proposals){if(!HEX.test(p?.commitment)||blocks.has(p.commitment))throw Error('Invalid proposal commitment');blocks.add(p.commitment)}
 const unique=new Map(),equivocators=new Set(),rejected=[];
 for(const vote of votes){
  if(!known.has(vote?.validatorId)||!blocks.has(vote?.commitment)){rejected.push('unknown_vote');continue}
  // Simulated votes have no cryptographic authentication. Do not use for settlement.
  const prior=unique.get(vote.validatorId);
  if(prior&&prior!==vote.commitment)equivocators.add(vote.validatorId);
  else unique.set(vote.validatorId,vote.commitment);
 }
 const counts=new Map([...blocks].map(id=>[id,0]));
 for(const [id,commitment] of unique)if(!equivocators.has(id))counts.set(commitment,counts.get(commitment)+1);
 const candidates=[...counts].filter(([,count])=>count>=quorum);
 return Object.freeze({status:equivocators.size?'EQUIVOCATION_OBSERVED':candidates.length?'SIMULATED_QUORUM':'NO_QUORUM',candidate:candidates.length===1?candidates[0][0]:null,counts:Object.fromEntries(counts),equivocators:[...equivocators].sort(),rejected,authenticated:false,canAssertFinality:false});
}
