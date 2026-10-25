/** Genesis v0.7: single-process crash-recovery laboratory.
 * Requires one writer per directory. Atomic rename is not equivalent to power-loss durability.
 * Not a network consensus engine or a production database.
 */
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {finalizeOfflineBlock} from './earthchain-finalization-lab.mjs';
import {importJournal,exportJournal} from './earthchain-recovery-lab.mjs';
async function atomicWrite(path,content){
 await mkdir(dirname(path),{recursive:true});
 const temp=path+'.'+randomUUID()+'.tmp';
 try{await writeFile(temp,content,{encoding:'utf8',flag:'wx',mode:0o600});await rename(temp,path);}
 catch(e){await rm(temp,{force:true});throw e;}
}
export async function initializeFinalizationStore(path,chain,allocations){
 const journal=exportJournal(chain,allocations);
 try{await readFile(path,'utf8');throw Error('Store already initialized');}
 catch(e){if(e.code!=='ENOENT')throw e;}
 await atomicWrite(path,JSON.stringify({format:'earthchain-finalization-v1',journal,finalized:[]}));
 return recoverFinalizationStore(path);
}
export async function recoverFinalizationStore(path){
 const doc=JSON.parse(await readFile(path,'utf8'));
 if(doc.format!=='earthchain-finalization-v1'||!Array.isArray(doc.finalized))throw Error('Invalid finalization store');
 const chain=importJournal(doc.journal);
 if(doc.finalized.length!==chain.blocks.length)throw Error('Finalization history mismatch');
 for(let i=0;i<doc.finalized.length;i++){
  const f=doc.finalized[i],block=chain.blocks[i];
  if(f.height!==block.height||f.hash!==block.hash)throw Error('Finalized block mismatch');
 }
 return {chain,finalized:doc.finalized};
}
export async function commitFinalizedBlock({path,block,validatorKeys,votes,allocations,previousVotes=[]}){
 const current=await recoverFinalizationStore(path);
 const result=finalizeOfflineBlock({chain:current.chain,block,validatorKeys,votes,allocations,previousVotes});
 const finalized=[...current.finalized,{height:block.height,hash:block.hash}];
 await atomicWrite(path,JSON.stringify({format:'earthchain-finalization-v1',journal:result.journal,finalized}));
 return recoverFinalizationStore(path);
}
