/** Strict native EC receipt schema and independent verifier boundary.
 * This is a contract only. No production validator or trusted proof source is configured.
 */
const HEX64=/^[a-f0-9]{64}$/;
const ADDRESS=/^ec_[a-f0-9]{32}$/;
export function parseNativeEcReceipt(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid native receipt');
 const fields=['schema','networkId','asset','transactionHash','blockHash','blockHeight','from','to','amountMinorUnits','confirmations'];
 if(Object.keys(input).sort().join()!==fields.sort().join())throw Error('Unexpected native receipt fields');
 if(input.schema!=='earthchain.native-receipt.v1'||input.asset!=='EC'||typeof input.networkId!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(input.networkId)||!HEX64.test(input.transactionHash)||!HEX64.test(input.blockHash)||!Number.isSafeInteger(input.blockHeight)||input.blockHeight<1||!ADDRESS.test(input.from)||!ADDRESS.test(input.to)||typeof input.amountMinorUnits!=='string'||!/^[1-9][0-9]*$/.test(input.amountMinorUnits)||!Number.isSafeInteger(input.confirmations)||input.confirmations<0)throw Error('Invalid native EC receipt values');
 return Object.freeze({...input});
}
export async function inspectNativeEcDelivery(order,receipt,{expectedNetworkId,expectedSender,verifyFinality}={}){
 if(order?.state!=='DELIVERY_PENDING')throw Error('Delivery not pending');
 const r=parseNativeEcReceipt(receipt);
 if(!expectedNetworkId||r.networkId!==expectedNetworkId||!expectedSender||r.from!==expectedSender||r.to!==order.walletAddress||r.amountMinorUnits!==order.quote.ecMinorUnits)throw Error('Network, sender, destination or amount mismatch');
 if(typeof verifyFinality!=='function')throw Error('Independent finality verifier required');
 const verified=await verifyFinality(r);
 if(verified!==true)throw Error('Native EC finality not verified');
 return Object.freeze({receipt:r,verified:true,canSettleUsd:false,canActivatePayments:false});
}
