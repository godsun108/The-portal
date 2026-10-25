/** Cross-round validator lock safety explorer.
 * Conservative no-unlock policy; reports stalls instead of unsafe progress.
 */
import {inspectOfflineLockProposal} from './ec-offline-locks.mjs';
export function exploreOfflineLockSafety({states,proposals,maxRound=10}){
 if(!Array.isArray(states)||states.length<4||!Array.isArray(proposals)||proposals.length>100||!Number.isSafeInteger(maxRound)||maxRound<0||maxRound>1000)throw Error('Invalid safety exploration');
 const decisions=[];
 for(const p of proposals){
  if(!Number.isSafeInteger(p?.round)||p.round<0||p.round>maxRound)throw Error('Invalid proposal round');
  const votes=[];
  for(const s of states){const inspection=inspectOfflineLockProposal(s,p);votes.push({validatorId:s.validatorId,allowed:inspection.allowed})}
  decisions.push(Object.freeze({round:p.round,commitment:p.commitment,allowed:votes.filter(v=>v.allowed).map(v=>v.validatorId),blocked:votes.filter(v=>!v.allowed).map(v=>v.validatorId)}));
 }
 return Object.freeze({decisions,unlocksAllowed:false,canAssertLiveness:false,canAssertFinality:false,kind:'OFFLINE_LOCK_SAFETY_EXPLORER'});
}
