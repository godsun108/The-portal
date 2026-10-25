/** Write-before-sign research adapter. Storage must durably commit before sign() is invoked.
 * The adapter does not implement persistence, transactions or hardware rollback protection.
 */
import {stageOfflineSafetyVote,exportOfflineSafetySnapshot,importOfflineSafetySnapshot} from './ec-offline-safety-snapshot.mjs';
export async function persistBeforeOfflineSign({state,vote,saveDurably,sign}){
 if(typeof saveDurably!=='function'||typeof sign!=='function')throw Error('Missing persistence or signing callback');
 const next=stageOfflineSafetyVote(state,vote);
 const snapshot=await exportOfflineSafetySnapshot(next);
 const receipt=await saveDurably(snapshot);
 if(receipt?.durable!==true)throw Error('Durable write not acknowledged; signing blocked');
 const signature=await sign(vote);
 return Object.freeze({state:next,snapshot,signature});
}
export async function recoverOfflineSigner({snapshot,networkId,validatorId,minLastRound}){
 return importOfflineSafetySnapshot(snapshot,{networkId,validatorId,minLastRound});
}
