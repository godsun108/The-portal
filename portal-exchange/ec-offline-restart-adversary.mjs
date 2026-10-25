/** Offline restart adversary experiment: repeated writes, recoveries, and conflicting votes.
 * This is not a proof against malicious disk rollback, concurrent signers or power loss.
 */
import {initialOfflineSafetyState} from './ec-offline-safety-snapshot.mjs';
import {persistBeforeOfflineSign,recoverOfflineSigner} from './ec-offline-write-before-sign.mjs';
export async function exerciseOfflineRestartSequence({store,networkId,validatorId,votes,crashAfterWriteAt=[]}){
 if(!store||typeof store.saveDurably!=='function'||typeof store.load!=='function'||!Array.isArray(votes)||votes.length>128)throw Error('Invalid restart experiment');
 let state=initialOfflineSafetyState({networkId,validatorId}),signed=[],blocked=[];
 for(let i=0;i<votes.length;i++){
  try{
   await persistBeforeOfflineSign({state,vote:votes[i],saveDurably:store.saveDurably,sign:async vote=>{
    if(crashAfterWriteAt.includes(i))throw Error('Injected signer crash');
    signed.push(vote);return 'offline-signature-placeholder';
   }});
  }catch(e){blocked.push({index:i,reason:String(e.message)})}
  try{state=await recoverOfflineSigner({snapshot:await store.load(),networkId,validatorId})}
  catch(e){if(i===0&&blocked.length)continue;throw e}
 }
 return Object.freeze({signed,blocked,finalState:state,canAssertProductionSafety:false});
}
