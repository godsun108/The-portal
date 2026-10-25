/** Cross-process cooperative signing wrapper.
 * All writers MUST use the same lock and durable store path. No automatic stale
 * lock removal, no remote filesystem safety or protection from rogue writers.
 */
import {persistBeforeOfflineSign,recoverOfflineSigner} from './ec-offline-write-before-sign.mjs';
import {createOfflineProcessLock} from './ec-offline-process-lock.node.mjs';
export function createOfflineProcessLockedSigner({lockPath,store,networkId,validatorId,sign}){
 if(typeof sign!=='function'||typeof store?.load!=='function'||typeof store?.saveDurably!=='function')throw Error('Invalid signer dependencies');
 const lock=createOfflineProcessLock(lockPath);
 return Object.freeze({signVote(vote){
  return lock.withLock(async()=>{
   const state=await recoverOfflineSigner({snapshot:await store.load(),networkId,validatorId});
   return persistBeforeOfflineSign({state,vote,saveDurably:store.saveDurably,sign});
  });
 }});
}
