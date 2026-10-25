/** Offline validator membership boundary checker.
 * No actual node networking, block acceptance or consensus finality.
 */
import {validateOfflineValidatorEpoch} from './ec-offline-epochs.mjs';
export function inspectOfflineMembershipBoundary({currentEpoch,nextEpoch,activationHeight,height,observations}){
 const old=validateOfflineValidatorEpoch(currentEpoch),next=validateOfflineValidatorEpoch(nextEpoch);
 if(next.epoch!==old.epoch+1||!Number.isSafeInteger(activationHeight)||activationHeight<1||!Number.isSafeInteger(height)||height<0||!Array.isArray(observations))throw Error('Invalid epoch boundary');
 const expected=height<activationHeight?old.epoch:next.epoch;
 const accepted=[],stale=[],invalid=[];
 for(const o of observations){
  if(!Number.isSafeInteger(o?.epoch)||typeof o?.validatorId!=='string'){invalid.push(o);continue}
  const epoch=o.epoch===old.epoch?old:o.epoch===next.epoch?next:null;
  if(!epoch||!epoch.validatorIds.includes(o.validatorId)){invalid.push(o);continue}
  if(o.epoch!==expected)stale.push(o.validatorId);
  else accepted.push(o.validatorId);
 }
 return Object.freeze({expectedEpoch:expected,accepted,stale,invalidCount:invalid.length,hasStaleViews:stale.length>0,canAssertFinality:false});
}
