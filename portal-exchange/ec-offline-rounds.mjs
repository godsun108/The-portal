/** Deterministic timeout and round progression for an offline vote experiment.
 * No wall-clock scheduling, network delivery, locks or consensus finality.
 */
import {verifyOfflineSignedVotes} from './ec-offline-signed-votes.mjs';
export async function evaluateOfflineRounds({networkId,height,rounds,validators,quorum,maxRounds=20}){
 if(!Array.isArray(rounds)||rounds.length<1||rounds.length>maxRounds||!Number.isSafeInteger(maxRounds)||maxRounds<1)throw Error('Invalid round schedule');
 const history=[];let expectedRound=0;
 for(const entry of rounds){
  if(entry?.round!==expectedRound||!Array.isArray(entry.votes)||typeof entry.timedOut!=='boolean')throw Error('Nonsequential or invalid round');
  const result=await verifyOfflineSignedVotes({networkId,height,round:entry.round,votes:entry.votes,validators,quorum});
  history.push(Object.freeze({round:entry.round,status:result.status,candidate:result.candidate,timedOut:entry.timedOut,equivocators:result.equivocators}));
  if(result.status==='SIGNED_EQUIVOCATION')return Object.freeze({status:'HALT_EQUIVOCATION',history,canAssertFinality:false});
  if(result.status==='SIGNED_QUORUM')return Object.freeze({status:'QUORUM_OBSERVED_NOT_FINALITY',candidate:result.candidate,history,canAssertFinality:false});
  if(!entry.timedOut)return Object.freeze({status:'WAIT_FOR_MORE_MESSAGES',history,canAssertFinality:false});
  expectedRound++;
 }
 return Object.freeze({status:'EXHAUSTED_TIMEOUT_ROUNDS',history,canAssertFinality:false});
}
