/** Fail-closed offline validator rotation activation.
 * The signed certificate is checked before the membership switch.
 */
import {verifyEpochTransitionCertificate} from './ec-offline-epoch-certificate.mjs';
import {validateOfflineValidatorEpoch} from './ec-offline-epochs.mjs';
export async function activateOfflineValidatorEpoch({networkId,currentEpoch,nextEpoch,activationHeight,currentHeight,signatures}){
 if(!Number.isSafeInteger(currentHeight)||currentHeight<0)throw Error('Invalid current height');
 const certificate=await verifyEpochTransitionCertificate({networkId,currentEpoch,nextEpoch,activationHeight,signatures});
 if(!certificate.approved)return Object.freeze({status:'REJECT_UNVERIFIED_ROTATION',activeEpoch:currentEpoch.epoch,canAssertFinality:false});
 if(currentHeight<activationHeight)return Object.freeze({status:'PENDING_ACTIVATION_HEIGHT',activeEpoch:currentEpoch.epoch,canAssertFinality:false});
 if(currentHeight!==activationHeight)return Object.freeze({status:'REJECT_MISSED_ACTIVATION_BOUNDARY',activeEpoch:currentEpoch.epoch,canAssertFinality:false});
 const next=validateOfflineValidatorEpoch(nextEpoch);
 return Object.freeze({status:'SIMULATED_ROTATION_ACTIVATED',activeEpoch:next.epoch,validatorIds:next.validatorIds,quorum:next.quorum,canAssertFinality:false});
}
