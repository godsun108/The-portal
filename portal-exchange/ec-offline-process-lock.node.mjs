/** Cooperative cross-process lock for offline Node validator research.
 * Exclusive mkdir is atomic on supported local filesystems. Fail closed on stale
 * locks; manual recovery only. Not a distributed lease or production fencing token.
 */
import {mkdir,rmdir} from 'node:fs/promises';
export function createOfflineProcessLock(lockPath){
 if(typeof lockPath!=='string'||!lockPath.endsWith('.lock'))throw Error('Invalid lock path');
 return Object.freeze({
  async withLock(operation){
   if(typeof operation!=='function')throw Error('Invalid locked operation');
   try{await mkdir(lockPath)}catch(e){if(e?.code==='EEXIST')throw Error('Validator lock held: signing blocked');throw e}
   try{return await operation()}finally{await rmdir(lockPath)}
  }
 });
}
