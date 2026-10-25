/** Offline validator-set epoch transition policy.
 * Changes are explicit and never inferred from a single certificate.
 */
const ID=/^[a-zA-Z0-9_-]{1,64}$/;
export function validateOfflineValidatorEpoch(epoch){
 if(!epoch||!Number.isSafeInteger(epoch.epoch)||epoch.epoch<0||!Array.isArray(epoch.validators)||epoch.validators.length<4)throw Error('Invalid validator epoch');
 const ids=epoch.validators.map(v=>v?.id);
 if(ids.some(id=>typeof id!=='string'||!ID.test(id))||new Set(ids).size!==ids.length||epoch.validators.some(v=>typeof v.publicKey!=='string'||v.publicKey.length<32))throw Error('Invalid validator identities');
 if(!Number.isSafeInteger(epoch.quorum)||epoch.quorum<=epoch.validators.length*2/3||epoch.quorum>epoch.validators.length)throw Error('Unsafe epoch quorum');
 return Object.freeze({epoch:epoch.epoch,validatorIds:Object.freeze([...ids].sort()),quorum:epoch.quorum});
}
export function inspectOfflineEpochTransition(current,next,{approvedByPriorEpoch=false,activationHeight}={}){
 const a=validateOfflineValidatorEpoch(current),b=validateOfflineValidatorEpoch(next);
 const reasons=[];
 if(b.epoch!==a.epoch+1)reasons.push('nonsequential_epoch');
 if(!Number.isSafeInteger(activationHeight)||activationHeight<1)reasons.push('invalid_activation_height');
 if(approvedByPriorEpoch!==true)reasons.push('prior_epoch_approval_unverified');
 return Object.freeze({allowed:reasons.length===0,reasons,activationHeight,canAssertConsensusFinality:false});
}
