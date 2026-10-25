/** Local-only validator persistence and equivocation laboratory. No sockets, BFT consensus, or production deployment. */
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {importJournal,exportJournal} from './earthchain-recovery-lab.mjs';
export async function saveValidatorJournal(file,chain,allocations){
 const payload=exportJournal(chain,allocations);
 await mkdir(dirname(file),{recursive:true});
 const tmp=file+'.'+randomUUID()+'.tmp';
 try {await writeFile(tmp,payload,{encoding:'utf8',flag:'wx',mode:0o600});await rename(tmp,file);}
 catch(e){await rm(tmp,{force:true});throw e;}
 return file;
}
export async function loadValidatorJournal(file){return importJournal(await readFile(file,'utf8'));}
export function detectEquivocation(votes){
 const seen=new Map(),conflicts=[];
 for(const vote of votes){
  if(!vote||typeof vote.validator!=='string'||typeof vote.chainId!=='string'||!Number.isSafeInteger(vote.height)||typeof vote.parent!=='string'||typeof vote.blockHash!=='string')throw Error('Invalid vote');
  const key=JSON.stringify([vote.validator,vote.chainId,vote.height,vote.parent]);
  if(seen.has(key)&&seen.get(key)!==vote.blockHash)conflicts.push({validator:vote.validator,height:vote.height,first:seen.get(key),second:vote.blockHash});
  else seen.set(key,vote.blockHash);
 }
 return conflicts;
}
export function simulateBroadcast(validators,messages,offline=[]){
 if(!Array.isArray(validators)||new Set(validators).size!==validators.length||!Array.isArray(messages)||!Array.isArray(offline))throw Error('Invalid network simulation');
 const deliveries=Object.fromEntries(validators.map(v=>[v,[]]));
 for(const message of messages){
  if(!validators.includes(message.from))throw Error('Unknown sender');
  for(const validator of validators)if(!offline.includes(validator)&&validator!==message.from)deliveries[validator].push(structuredClone(message));
 }
 return deliveries;
}
