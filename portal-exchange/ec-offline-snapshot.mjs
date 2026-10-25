/** Offline chain snapshot codec: tamper-evident reload via independent quorum replay.
 * JSON is not trusted; callers supply a trusted genesis and validator set.
 */
import {emptyOfflineChain,appendOfflineBlock} from './ec-offline-chain.mjs';
export function exportOfflineSnapshot(chain){
 if(chain?.schema!=='earthchain.offline.chain.v0'||!Array.isArray(chain.blocks))throw Error('Invalid chain snapshot');
 return JSON.stringify({schema:chain.schema,networkId:chain.networkId,genesisHash:chain.genesisHash,blocks:chain.blocks.map(x=>({block:x.block,certificate:x.certificate}))});
}
export async function importOfflineSnapshot(json,{networkId,genesisHash,validators,threshold,maxBlocks=1000}={}){
 if(typeof json!=='string'||json.length>8_000_000)throw Error('Snapshot size exceeded');
 const data=JSON.parse(json);
 if(data?.schema!=='earthchain.offline.chain.v0'||data.networkId!==networkId||data.genesisHash!==genesisHash||!Array.isArray(data.blocks)||data.blocks.length>maxBlocks)throw Error('Snapshot identity or size mismatch');
 let chain=emptyOfflineChain({networkId,genesisHash});
 for(const entry of data.blocks)chain=await appendOfflineBlock(chain,{block:entry.block,certificate:entry.certificate,validators,threshold});
 return chain;
}
