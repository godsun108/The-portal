/** Single-process offline validator signing coordinator.
 * Serializes requests, always reloads persisted signing history, and fails closed.
 * NOT safe for multi-process, multi-host, malicious rollback or production validators.
 */
import {persistBeforeOfflineSign,recoverOfflineSigner} from './ec-offline-write-before-sign.mjs';
export function createOfflineSerializedSigner({store,networkId,validatorId,sign}){
 if(!store||typeof store.load!=='function'||typeof store.saveDurably!=='function'||typeof sign!=='function')throw Error('Invalid signer dependencies');
 let queue=Promise.resolve();
 async function submit(vote){
  const snapshot=await store.load();
  const state=await recoverOfflineSigner({snapshot,networkId,validatorId});
  return persistBeforeOfflineSign({state,vote,saveDurably:store.saveDurably,sign});
 }
 return Object.freeze({
  signVote(vote){
   const work=queue.then(()=>submit(vote));
   queue=work.then(()=>undefined,()=>undefined);
   return work;
  }
 });
}
