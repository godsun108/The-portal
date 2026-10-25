/** Verify signed PREPARE quorum before updating a local validator lock.
 * Fail-closed offline research adapter, not a network consensus protocol.
 */
import {verifyPhaseVotes} from './ec-offline-phase-votes.mjs';
import {applyOfflineLockVote,inspectOfflineLockProposal} from './ec-offline-locks.mjs';
export async function lockFromVerifiedPrepare({state,round,commitment,prepareVotes,validators,quorum}){
 const result=await verifyPhaseVotes({networkId:state.networkId,height:state.height,round,phase:'PREPARE',votes:prepareVotes,validators,quorum});
 if(result.equivocators.length||result.candidate!==commitment)throw Error('Verified prepare quorum required');
 if(!inspectOfflineLockProposal(state,{round,commitment}).allowed)throw Error('Validator lock conflict');
 return applyOfflineLockVote(state,{round,commitment,hasVerifiedPrepareCertificate:true});
}
export async function inspectVerifiedCommit({state,round,commitment,commitVotes,validators,quorum}){
 if(state?.lockedCommitment!==commitment||state.lockedRound>round)throw Error('No matching validator lock');
 const result=await verifyPhaseVotes({networkId:state.networkId,height:state.height,round,phase:'COMMIT',votes:commitVotes,validators,quorum});
 return Object.freeze({status:result.equivocators.length?'HALT_EQUIVOCATION':result.candidate===commitment?'MATCHING_SIGNED_COMMIT_QUORUM':'NO_COMMIT_QUORUM',canAssertFinality:false});
}
