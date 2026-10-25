/** Cryptographically authenticated validator epoch rotation approval.
 * Offline governance research; not a live chain configuration change.
 */
import {validateOfflineValidatorEpoch} from './ec-offline-epochs.mjs';
const enc=new TextEncoder(),bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export function epochTransitionPayload({networkId,currentEpoch,nextEpoch,activationHeight}){
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId||'')||!Number.isSafeInteger(activationHeight)||activationHeight<1)throw Error('Invalid epoch transition context');
 const a=validateOfflineValidatorEpoch(currentEpoch),b=validateOfflineValidatorEpoch(nextEpoch);
 if(b.epoch!==a.epoch+1)throw Error('Nonsequential epoch');
 const sorted=e=>[...e.validators].map(v=>[v.id,v.publicKey]).sort((x,y)=>x[0].localeCompare(y[0]));
 return JSON.stringify(['earthchain.offline.epoch-transition.v0',networkId,a.epoch,b.epoch,activationHeight,a.quorum,b.quorum,sorted(currentEpoch),sorted(nextEpoch)]);
}
export async function verifyEpochTransitionCertificate({networkId,currentEpoch,nextEpoch,activationHeight,signatures}){
 const payload=epochTransitionPayload({networkId,currentEpoch,nextEpoch,activationHeight});
 if(!Array.isArray(signatures)||signatures.length>currentEpoch.validators.length*2)throw Error('Invalid epoch signatures');
 const keys=new Map(currentEpoch.validators.map(v=>[v.id,v.publicKey])),approved=new Set(),invalid=[];
 for(const item of signatures){
  if(!keys.has(item?.validatorId)){invalid.push('unknown_validator');continue}
  if(approved.has(item.validatorId))continue;
  try{
   const key=await crypto.subtle.importKey('spki',bytes(keys.get(item.validatorId)),'Ed25519',false,['verify']);
   if(!await crypto.subtle.verify('Ed25519',key,bytes(item.signature),enc.encode(payload)))throw Error('bad signature');
   approved.add(item.validatorId);
  }catch{invalid.push('invalid_signature')}
 }
 return Object.freeze({approved:approved.size>=currentEpoch.quorum,validSigners:[...approved].sort(),invalid,required:currentEpoch.quorum,canAssertProductionAuthorization:false});
}
