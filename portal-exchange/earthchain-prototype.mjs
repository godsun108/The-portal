/** Deterministic, valueless EarthChain prototype. NOT consensus, cryptographic signatures, or a production blockchain. */
export function createGenesis(allocations){
 if(!allocations||typeof allocations!=='object'||Array.isArray(allocations)||Object.keys(allocations).length===0)throw Error('Invalid genesis');
 const balances={};let supply=0;
 for(const [account,amount] of Object.entries(allocations)){
  if(!account||account==='__proto__'||account==='constructor'||!Number.isSafeInteger(amount)||amount<0)throw Error('Invalid allocation');
  supply+=amount;if(!Number.isSafeInteger(supply))throw Error('Supply overflow');
  balances[account]=amount;
 }
 return {balances,supply,height:0,seen:[],history:[]};
}
export function applyTransaction(state,{from,to,amount,nonce}){
 if(typeof from!=='string'||typeof to!=='string'||!from||!to||from===to||!Object.hasOwn(state.balances,from)||!Object.hasOwn(state.balances,to)||!Number.isSafeInteger(amount)||amount<=0||typeof nonce!=='string'||!nonce.trim())throw Error('Invalid transaction');
 const id=JSON.stringify([from,nonce]);
 if(state.seen.includes(id))throw Error('Replay');
 if(state.balances[from]<amount)throw Error('Insufficient balance');
 const next={balances:{...state.balances},supply:state.supply,height:state.height+1,seen:[...state.seen,id],history:[...state.history,{from,to,amount,nonce}]};
 next.balances[from]-=amount;next.balances[to]+=amount;
 if(!Number.isSafeInteger(next.balances[to]))throw Error('Balance overflow');
 return next;
}
export function validateChain(genesis,transactions){
 let state=createGenesis(genesis);
 for(const tx of transactions)state=applyTransaction(state,tx);
 const total=Object.values(state.balances).reduce((n,v)=>n+v,0);
 if(total!==state.supply)throw Error('Supply invariant violated');
 return state;
}
