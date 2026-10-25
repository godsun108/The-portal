/** Offline validator lock recovery policy: never auto-break an existing lock.
 * Operator must establish process termination and exclusive storage ownership.
 * This helper only INSPECTS, never removes a lock.
 */
import {stat,readFile} from 'node:fs/promises';
export async function inspectOfflineValidatorLock(lockPath){
 try{
  const info=await stat(lockPath);
  if(!info.isDirectory())throw Error('Unexpected validator lock type');
  let owner=null;
  try{owner=JSON.parse(await readFile(lockPath+'/owner.json','utf8'))}catch{}
  return Object.freeze({held:true,owner,automaticRecoveryAllowed:false,action:'STOP_AND_INVESTIGATE'});
 }catch(e){
  if(e?.code==='ENOENT')return Object.freeze({held:false,owner:null,automaticRecoveryAllowed:false,action:'NO_LOCK_FOUND'});
  throw e;
 }
}
