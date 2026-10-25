/** Offline adversarial epoch-boundary verification harness.
 * Validates signed rotation and phase votes with the correct epoch keys.
 * No production consensus or networking.
 */
import {verifyEpochTransitionCertificate} from './ec-offline-epoch-certificate.mjs';
import {verifyPhaseVotes} from './ec-offline-phase-votes.mjs';
export async function inspectSignedEpochBoundary({networkId,currentEpoch,nextEpoch,activationHeight,height,signatures,phase,round,commitment,votes}){
 if(!Number.isSafeInteger(height)||height<0)throw Error('Invalid height');
 const certificate=await verifyEpochTransitionCertificate({networkId,currentEpoch,nextEpoch,activationHeight,signatures});
 if(!certificate.approved)return Object.freeze({status:'HALT_UNVERIFIED_ROTATION',canAssertFinality:false});
 const activeEpoch=height<activationHeight?currentEpoch:nextEpoch;
 const result=await verifyPhaseVotes({networkId,height,round,phase,votes,validators:activeEpoch.validators,quorum:activeEpoch.quorum});
 if(result.equivocators.length)return Object.freeze({status:'HALT_SIGNED_EQUIVOCATION',activeEpoch:activeEpoch.epoch,equivocators:result.equivocators,canAssertFinality:false});
 return Object.freeze({status:result.candidate===commitment?'ACTIVE_EPOCH_SIGNED_QUORUM':'NO_ACTIVE_EPOCH_QUORUM',activeEpoch:activeEpoch.epoch,invalidVotes:result.invalid.length,canAssertFinality:false});
}
