/** Deterministic offline chain sequence and fork detection.
 * Requires independently verified quorum evidence for every appended block.
 * No network consensus, persistence, or production finality.
 */
import {blockCommitment,verifyOfflineQuorum} from './ec-offline-quorum.mjs';
const HEX=/^[a-f0-9]{64}$/;
export function emptyOfflineChain({networkId,genesisHash}){
 if(typeof networkId!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId)||!HEX.test(genesisHash))throw Error('Invalid offline genesis');
 return Object.freeze({schema:'earthchain.offline.chain.v0',networkId,genesisHash,blocks:Object.freeze([])});
}
export async function appendOfflineBlock(chain,{block,certificate,validators,threshold}){
 if(chain?.schema!=='earthchain.offline.chain.v0'||!Array.isArray(chain.blocks))throw Error('Invalid chain');
 if(block?.networkId!==chain.networkId)throw Error('Wrong network');
 const prior=chain.blocks.at(-1);
 if(block.height!==chain.blocks.length+1||block.parentHash!==(prior?.commitment??chain.genesisHash))throw Error('Height or parent mismatch');
 const quorum=await verifyOfflineQuorum(block,certificate,validators,{threshold});
 const commitment=await blockCommitment(block);
 const record=Object.freeze({block:Object.freeze({...block}),commitment,certificate:structuredClone(certificate),validatorIds:Object.freeze(validators.map(v=>v.id).sort()),quorum:quorum.validSignatures});
 return Object.freeze({...chain,blocks:Object.freeze([...chain.blocks,record])});
}
export function detectOfflineFork(left,right){
 if(left?.networkId!==right?.networkId||left?.genesisHash!==right?.genesisHash)throw Error('Incomparable chains');
 const limit=Math.min(left.blocks.length,right.blocks.length);
 for(let i=0;i<limit;i++)if(left.blocks[i].commitment!==right.blocks[i].commitment)return Object.freeze({conflict:true,height:i+1,left:left.blocks[i].commitment,right:right.blocks[i].commitment});
 return Object.freeze({conflict:false,commonHeight:limit,leftHeight:left.blocks.length,rightHeight:right.blocks.length});
}
