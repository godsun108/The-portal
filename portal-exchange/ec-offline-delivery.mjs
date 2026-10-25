/** Deterministic offline message-delivery experiment.
 * No network sockets, signatures, or real Byzantine consensus.
 */
import {simulateOfflineVoteRound} from './ec-offline-vote-round.mjs';
export function simulateOfflineDelivery({validatorIds,proposals,messages,quorum,dropTo=[]}){
 if(!Array.isArray(messages)||messages.length>10000||!Array.isArray(dropTo))throw Error('Invalid delivery experiment');
 const validRecipients=new Set(validatorIds);
 if(dropTo.some(id=>!validRecipients.has(id)))throw Error('Unknown partition recipient');
 const partition=new Set(dropTo),views={};
 for(const recipient of validatorIds){
  const delivered=[];
  for(const message of messages){
   if(!validRecipients.has(message?.to)||!validRecipients.has(message?.from)||message.to!==recipient)continue;
   if(partition.has(recipient))continue;
   delivered.push({validatorId:message.from,commitment:message.commitment});
  }
  views[recipient]=simulateOfflineVoteRound({validatorIds,proposals,votes:delivered,quorum});
 }
 const candidates=new Set(Object.values(views).map(v=>v.candidate).filter(Boolean));
 return Object.freeze({views,partitioned:[...partition].sort(),conflictingObservedCandidates:candidates.size>1,canAssertFinality:false,kind:'OFFLINE_MESSAGE_DELIVERY_ONLY'});
}
