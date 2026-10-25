/** Detect competing authenticated quorum certificates across an epoch boundary.
 * Research-only: does not establish consensus finality or implement view changes.
 */
import {verifyEpochTransitionCertificate} from './ec-offline-epoch-certificate.mjs';
import {verifyPhaseVotes} from './ec-offline-phase-votes.mjs';
export async function inspectOfflineCrossEpochConflict({networkId,currentEpoch,nextEpoch,activationHeight,signatures,certificates}){
 const rotation=await verifyEpochTransitionCertificate({networkId,currentEpoch,nextEpoch,activationHeight,signatures});
 if(!rotation.approved)return Object.freeze({status:'HALT_UNVERIFIED_ROTATION',canAssertFinality:false});
 if(!Array.isArray(certificates)||certificates.length<2||certificates.length>16)throw Error('Invalid certificate comparison');
 const verified=[];
 for(const c of certificates){
  if(!Number.isSafeInteger(c?.height)||c.height<1||!Number.isSafeInteger(c.round)||c.round<0||!['PREPARE','COMMIT'].includes(c.phase))throw Error('Invalid certificate');
  const epoch=c.height<activationHeight?currentEpoch:nextEpoch;
  const result=await verifyPhaseVotes({networkId,height:c.height,round:c.round,phase:c.phase,votes:c.votes,validators:epoch.validators,quorum:epoch.quorum});
  if(result.equivocators.length)return Object.freeze({status:'HALT_SIGNED_EQUIVOCATION',canAssertFinality:false});
  if(result.candidate)verified.push({height:c.height,round:c.round,phase:c.phase,commitment:result.candidate,epoch:epoch.epoch});
 }
 for(let i=0;i<verified.length;i++)for(let j=i+1;j<verified.length;j++){
  const a=verified[i],b=verified[j];
  if(a.height===b.height&&a.phase===b.phase&&a.commitment!==b.commitment)return Object.freeze({status:'HALT_CONFLICTING_SIGNED_CERTIFICATES',conflicts:[a,b],canAssertFinality:false});
 }
 return Object.freeze({status:'NO_CONFLICT_OBSERVED',verified,canAssertFinality:false});
}
