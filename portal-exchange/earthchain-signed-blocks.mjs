/** EarthChain Genesis v0.2: offline signed-block laboratory, NOT a network or consensus protocol. */
import {createHash,createPublicKey,verify} from 'node:crypto';
import {createGenesis,applyTransaction} from './earthchain-prototype.mjs';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const canonicalTx=({from,to,amount,nonce,chainId})=>JSON.stringify({from,to,amount,nonce,chainId});
export function signableTransaction(tx){return Buffer.from(canonicalTx(tx));}
export function accountFromPublicKey(publicKey){return createPublicKey(publicKey).export({type:'spki',format:'pem'});}
export function verifySignedTransaction(signed,chainId){
 if(!signed||signed.chainId!==chainId||typeof signed.publicKey!=='string'||typeof signed.signature!=='string'||!/^[0-9a-f]+$/i.test(signed.signature)||signed.signature.length%2)throw Error('Invalid signature envelope');
 const key=accountFromPublicKey(signed.publicKey);
 if(signed.from!==key||!verify(null,signableTransaction(signed),key,Buffer.from(signed.signature,'hex')))throw Error('Signature verification failed');
 return {from:signed.from,to:signed.to,amount:signed.amount,nonce:signed.nonce};
}
export function createSignedGenesis(chainId,allocations){
 if(typeof chainId!=='string'||!chainId.trim())throw Error('Invalid chain ID');
 const state=createGenesis(allocations);
 return {chainId,state,tip:digest({chainId,allocations}),blocks:[]};
}
export function proposeBlock(chain,transactions,proposer){
 if(!Array.isArray(transactions)||!transactions.length||typeof proposer!=='string'||!proposer)throw Error('Invalid block');
 const body={chainId:chain.chainId,height:chain.state.height+1,parent:chain.tip,proposer,transactions};
 return {...body,hash:digest(body)};
}
export function applySignedBlock(chain,block){
 if(block.chainId!==chain.chainId||block.parent!==chain.tip||block.height!==chain.state.height+1||!Array.isArray(block.transactions)||!block.transactions.length||typeof block.proposer!=='string'||!block.proposer)throw Error('Invalid block linkage');
 const {hash,...body}=block;
 if(hash!==digest(body))throw Error('Block hash mismatch');
 let state=chain.state;
 for(const tx of block.transactions)state=applyTransaction(state,verifySignedTransaction(tx,chain.chainId));
 const sum=Object.values(state.balances).reduce((a,b)=>a+b,0);
 if(sum!==state.supply)throw Error('Supply invariant');
 return {...chain,state,tip:hash,blocks:[...chain.blocks,block]};
}
