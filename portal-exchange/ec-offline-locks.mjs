/** Deterministic validator locking state machine for offline BFT research.
 * No cryptographic authorization; call only after verifying signed votes.
 */
const HASH=/^[a-f0-9]{64}$/;
export function newOfflineValidatorLock({networkId,height,validatorId}){
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId||'')||!Number.isSafeInteger(height)||height<1||!/^[a-zA-Z0-9_-]{1,64}$/.test(validatorId||''))throw Error('Invalid validator lock identity');
 return Object.freeze({networkId,height,validatorId,lockedCommitment:null,lockedRound:-1,lastVotedRound:-1});
}
export function applyOfflineLockVote(state,{round,commitment,hasVerifiedPrepareCertificate=false}){
 if(!state||!Number.isSafeInteger(round)||round<0||!HASH.test(commitment)||round<=state.lastVotedRound)throw Error('Invalid or repeated voting round');
 if(state.lockedCommitment!==null&&state.lockedCommitment!==commitment)throw Error('LOCKED_CONFLICT_REJECTED');
 if(hasVerifiedPrepareCertificate!==true)throw Error('Prepare certificate required for lock');
 return Object.freeze({...state,lockedCommitment:commitment,lockedRound:round,lastVotedRound:round});
}
export function inspectOfflineLockProposal(state,{round,commitment}){
 if(!state||!Number.isSafeInteger(round)||round<0||!HASH.test(commitment))throw Error('Invalid proposal');
 return Object.freeze({allowed:round>state.lastVotedRound&&(state.lockedCommitment===null||state.lockedCommitment===commitment),requiresVerifiedPrepareCertificate:true,canAssertFinality:false});
}
