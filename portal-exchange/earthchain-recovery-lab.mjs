/** Offline durable-replay format. Host must persist JSON atomically; no built-in disk writes. */
import {createSignedGenesis,applySignedBlock} from './earthchain-signed-blocks.mjs';
export function recoverChain({chainId,allocations,blocks}){
 if(!Array.isArray(blocks))throw Error('Invalid journal');
 let chain=createSignedGenesis(chainId,allocations);
 for(const block of blocks)chain=applySignedBlock(chain,block);
 return chain;
}
export function exportJournal(chain,allocations){
 const recovered=recoverChain({chainId:chain.chainId,allocations,blocks:chain.blocks});
 if(recovered.tip!==chain.tip||JSON.stringify(recovered.state)!==JSON.stringify(chain.state))throw Error('Journal state mismatch');
 return JSON.stringify({format:'earthchain-lab-journal-v1',chainId:chain.chainId,allocations,blocks:chain.blocks});
}
export function importJournal(serialized){
 const doc=JSON.parse(serialized);
 if(doc.format!=='earthchain-lab-journal-v1')throw Error('Unknown journal format');
 return recoverChain(doc);
}
