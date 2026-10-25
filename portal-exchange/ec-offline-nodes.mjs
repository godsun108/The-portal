/** Independent offline node views: replay each peer's certified snapshot before comparison.
 * Simulates independent nodes, not networking or BFT consensus.
 */
import {importOfflineSnapshot} from './ec-offline-snapshot.mjs';
import {detectOfflineFork} from './ec-offline-chain.mjs';
export async function compareOfflineNodes({snapshots,networkId,genesisHash,validators,threshold}){
 if(!Array.isArray(snapshots)||snapshots.length<2||snapshots.length>16)throw Error('Require 2-16 independent offline node snapshots');
 const nodes=[];
 for(const item of snapshots){
  if(typeof item?.nodeId!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(item.nodeId))throw Error('Invalid node ID');
  const chain=await importOfflineSnapshot(item.json,{networkId,genesisHash,validators,threshold});
  nodes.push({nodeId:item.nodeId,chain});
 }
 if(new Set(nodes.map(n=>n.nodeId)).size!==nodes.length)throw Error('Duplicate node ID');
 const conflicts=[];
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const f=detectOfflineFork(nodes[i].chain,nodes[j].chain);
  if(f.conflict)conflicts.push({nodes:[nodes[i].nodeId,nodes[j].nodeId],height:f.height});
 }
 return Object.freeze({status:conflicts.length?'HALT_CONFLICT':'COMPATIBLE_PREFIXES',conflicts,nodes:nodes.map(n=>({nodeId:n.nodeId,height:n.chain.blocks.length,head:n.chain.blocks.at(-1)?.commitment??genesisHash})),canAssertDistributedFinality:false});
}
