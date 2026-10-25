/** Offline two-phase vote-lock experiment.
 * Not a complete BFT consensus protocol. Votes are verified by signed-vote verifier.
 */
import {verifyOfflineSignedVotes} from './ec-offline-signed-votes.mjs';
export async function evaluateOfflineTwoPhase({networkId,height,round,validators,quorum,prepareVotes,commitVotes}){
 const prepare=await verifyOfflineSignedVotes({networkId,height,round,votes:prepareVotes,validators,quorum});
 if(prepare.equivocators.length||!prepare.candidate)return Object.freeze({status:prepare.equivocators.length?'HALT_PREPARE_EQUIVOCATION':'NO_PREPARE_QUORUM',canAssertFinality:false});
 // This experiment deliberately uses the *next round* as the commit domain,
 // since the existing signed-vote payload has no phase field.
 const commit=await verifyOfflineSignedVotes({networkId,height,round:round+1,votes:commitVotes,validators,quorum});
 if(commit.equivocators.length)return Object.freeze({status:'HALT_COMMIT_EQUIVOCATION',canAssertFinality:false});
 if(commit.candidate!==prepare.candidate)return Object.freeze({status:commit.candidate?'CONFLICTING_PHASE_QUORUM':'NO_COMMIT_QUORUM',prepared:prepare.candidate,canAssertFinality:false});
 return Object.freeze({status:'TWO_PHASE_CERTIFICATE_OBSERVED',prepared:prepare.candidate,committed:commit.candidate,canAssertFinality:false,kind:'OFFLINE_RESEARCH_NOT_CONSENSUS'});
}
