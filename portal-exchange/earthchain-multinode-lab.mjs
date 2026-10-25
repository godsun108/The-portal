/** Genesis v0.8 deterministic multi-node partition simulation.
 * Demonstrates rejection of incompatible finalized histories; NOT Byzantine consensus.
 */
import {finalizeOfflineBlock} from './earthchain-finalization-lab.mjs';
export function simulateIndependentNodes({genesis,proposals,validatorKeys,allocations,offline=[]}){
 if(!Array.isArray(proposals)||!Array.isArray(offline))throw Error('Invalid simulation');
 const nodes=Object.fromEntries(Object.keys(validatorKeys).map(id=>[id,{chain:structuredClone(genesis),accepted:[],rejected:[]}]));
 for(const {block,votes,recipients} of proposals){
  if(!Array.isArray(recipients))throw Error('Invalid recipients');
  for(const id of recipients){
   if(!Object.hasOwn(nodes,id))throw Error('Unknown recipient');
   if(offline.includes(id))continue;
   try{
    const outcome=finalizeOfflineBlock({chain:nodes[id].chain,block,votes,validatorKeys,allocations});
    nodes[id].chain=outcome.chain;
    nodes[id].accepted.push(block.hash);
   }catch(error){nodes[id].rejected.push({hash:block.hash,reason:error.message});}
  }
 }
 return nodes;
}
export function compareFinalizedHistories(nodes){
 const ids=Object.keys(nodes),conflicts=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=nodes[ids[i]].chain.blocks,b=nodes[ids[j]].chain.blocks;
  for(let k=0;k<Math.min(a.length,b.length);k++)if(a[k].hash!==b[k].hash){conflicts.push({a:ids[i],b:ids[j],height:k+1});break;}
 }
 return {conflicts,consistent:conflicts.length===0};
}
