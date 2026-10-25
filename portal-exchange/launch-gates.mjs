/** Launch evidence registry: research checklist only, cannot authorize purchases. */
export const GATES=Object.freeze([
 ['token','Signed token specification, chain, contract deployment and independent verification'],
 ['legal','Qualified jurisdiction-specific counsel review of issuance, sales, custody and redemption'],
 ['provider','Written approval for EC sale through each proposed payment method'],
 ['liquidity','Verified executable EC quote source, slippage, fees and settlement route'],
 ['wallet','Independent security review of keys, recovery and signing'],
 ['settlement','Verified payment and token delivery reconciliation with idempotency'],
 ['operations','Fraud, dispute, refunds, monitoring, backup, incident response']
]);
export function newGateRegistry(){return {evidence:[]};}
export function addEvidence(registry,{gate,reference,reviewer,note}){
 if(!GATES.some(([id])=>id===gate)||![reference,reviewer,note].every(x=>typeof x==='string'&&x.trim()&&x.length<=500))throw Error('Invalid evidence');
 if(registry.evidence.some(x=>x.gate===gate&&x.reference===reference))throw Error('Duplicate evidence');
 const item=Object.freeze({gate,reference,reviewer,note,status:'pending_independent_review'});
 registry.evidence.push(item);return item;
}
export function report(registry){return GATES.map(([id,requirement])=>({id,requirement,evidenceCount:registry.evidence.filter(x=>x.gate===id).length,approved:false,status:'blocked'}));}
export function canEnableRealPurchases(){return false;} // Requires separate, reviewed production implementation.
