/** Offline signed validator votes. Laboratory only: no network consensus or production key custody. */
import {createPublicKey,verify} from 'node:crypto';
const voteMessage=({chainId,height,parent,blockHash})=>Buffer.from(JSON.stringify({chainId,height,parent,blockHash}));
export function signedVoteMessage(fields){return voteMessage(fields);}
export function verifyValidatorVotes({chain,block,validatorKeys,votes}){
 const ids=Object.keys(validatorKeys||{});
 if(ids.length<4||!Array.isArray(votes)||ids.some(id=>!id))throw Error('Invalid validator configuration');
 const required=Math.floor(ids.length*2/3)+1,seen=new Set(),approvals=[];
 for(const v of votes){
  if(!v||!Object.hasOwn(validatorKeys,v.validator)||seen.has(v.validator))throw Error('Unauthorized or duplicate validator vote');
  seen.add(v.validator);
  if(v.chainId!==chain.chainId||v.height!==block.height||v.parent!==block.parent||v.blockHash!==block.hash)throw Error('Vote does not match proposal');
  if(typeof v.signature!=='string'||!/^(?:[0-9a-f]{2})+$/i.test(v.signature)||!verify(null,voteMessage(v),createPublicKey(validatorKeys[v.validator]),Buffer.from(v.signature,'hex')))throw Error('Invalid validator signature');
  approvals.push(v.validator);
 }
 if(approvals.length<required)throw Error('Insufficient signed quorum');
 return {approvals,required};
}
