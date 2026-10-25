/** Illustrative, valueless ledger. Not money, stored value, or a wallet. */
export function newLedger(){return {entries:[],next:1};}
export function recordDemoEntry(ledger,{account,asset,delta,reference}){
 if(!['eUSD_DEMO','EC_DEMO'].includes(asset))throw Error('Unsupported demo asset');
 if(typeof account!=='string'||!account.trim()||typeof reference!=='string'||!reference.trim())throw Error('Invalid reference');
 if(!Number.isSafeInteger(delta)||delta===0)throw Error('Invalid integer minor-unit amount');
 if(ledger.entries.some(e=>e.reference===reference&&e.account===account&&e.asset===asset))throw Error('Duplicate entry');
 const prior=balanceDemo(ledger,account,asset);
 if(!Number.isSafeInteger(prior+delta)||prior+delta<0)throw Error('Insufficient demo balance or overflow');
 const entry=Object.freeze({id:ledger.next++,account,asset,delta,reference,simulated:true});
 ledger.entries.push(entry);return entry;
}
export function balanceDemo(ledger,account,asset){
 return ledger.entries.filter(e=>e.account===account&&e.asset===asset).reduce((sum,e)=>sum+e.delta,0);
}
export function demoTransfer(ledger,{from,to,asset,amount,reference}){
 if(from===to||!Number.isSafeInteger(amount)||amount<=0)throw Error('Invalid transfer');
 if(balanceDemo(ledger,from,asset)<amount)throw Error('Insufficient demo balance');
 if(ledger.entries.some(e=>e.reference===reference))throw Error('Duplicate transfer');
 recordDemoEntry(ledger,{account:from,asset,delta:-amount,reference});
 recordDemoEntry(ledger,{account:to,asset,delta:amount,reference});
 return {reference,asset,amount,simulated:true};
}
