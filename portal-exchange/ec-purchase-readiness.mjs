/** EC purchase readiness: fail-closed, no live purchases or quoted prices. */
export const EC_PURCHASE_STATUS=Object.freeze({tokenIssued:false,legalApproved:false,providerApproved:false,liquidityVerified:false,walletAudited:false,settlementVerified:false,realPaymentsEnabled:false});
export function readiness(status=EC_PURCHASE_STATUS){
 const checks=['tokenIssued','legalApproved','providerApproved','liquidityVerified','walletAudited','settlementVerified','realPaymentsEnabled'];
 return {ready:checks.every(k=>status[k]===true),missing:checks.filter(k=>status[k]!==true)};
}
export function requestPurchase({fundingMethod,amount,readinessStatus=EC_PURCHASE_STATUS}){
 if(!['card','apple_pay','bank','xrp'].includes(fundingMethod))throw Error('Unsupported funding method');
 if(typeof amount!=='number'||!Number.isFinite(amount)||amount<=0)throw Error('Invalid source amount');
 const state=readiness(readinessStatus);
 if(!state.ready) return Object.freeze({status:'blocked',reason:'EC purchases are not enabled',missing:state.missing,charged:false,tokenDelivered:false});
 // This module intentionally has no execution path even when flags are overridden.
 return Object.freeze({status:'blocked',reason:'No live transaction adapter implemented',charged:false,tokenDelivered:false});
}
