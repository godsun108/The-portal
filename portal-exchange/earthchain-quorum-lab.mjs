/** Offline quorum simulator: not Byzantine fault tolerant consensus, networking, or durable validator storage. */
import {applySignedBlock} from './earthchain-signed-blocks.mjs';
export function validateQuorum({validators,chain,block,votes}){
 if(!Array.isArray(validators)||validators.length<3||new Set(validators).size!==validators.length||validators.some(x=>typeof x!=='string'||!x))throw Error('Invalid validator set');
 if(!Array.isArray(votes))throw Error('Invalid votes');
 const required=Math.floor(validators.length*2/3)+1;
 const approvals=new Set();
 for(const vote of votes){
  if(!vote||!validators.includes(vote.validator)||typeof vote.blockHash!=='string')throw Error('Unauthorized vote');
  if(approvals.has(vote.validator))throw Error('Duplicate vote');
  if(vote.blockHash!==block.hash)throw Error('Conflicting block vote');
  approvals.add(vote.validator);
 }
 if(approvals.size<required)throw Error('Insufficient quorum');
 return {state:applySignedBlock(chain,block),approvals:approvals.size,required};
}
