/** Verify a *test-only* signed journal transfer against a simulated acquisition.
 * ECTEST is valueless and MUST NOT be represented as delivered native EC.
 */
import {verifyMutual} from '../earthchain-test/mutual-ledger.mjs';
import {advanceAcquisition} from './ec-fiat-delivery-simulator.mjs';
export async function inspectTestDelivery(order,bundle,config,{entryId,senderAddress}){
 if(order?.state!=='DELIVERY_PENDING')throw Error('Delivery not pending');
 const state=await verifyMutual(bundle,config);
 const entries=bundle.journal.entries.filter(e=>e.id===entryId);
 if(entries.length!==1)throw Error('Test receipt not found or ambiguous');
 const action=entries[0].packet.message.action;
 if(action.type!=='TRANSFER'||action.actor!==senderAddress||action.to!==order.walletAddress)throw Error('Test receipt destination mismatch');
 return Object.freeze({kind:'ECTEST_SIGNED_MUTUAL_JOURNAL',asset:'ECTEST',network:state.network,entryId,recipient:action.to,amount:action.amount,finality:state.finality,canConfirmRealEc:false,canSettleUsd:false});
}
export async function inspectAndRecordTestDelivery(order,bundle,config,details){
 const evidence=await inspectTestDelivery(order,bundle,config,details);
 // A real EC delivery requires independent native blockchain finality, not ECTEST.
 return Object.freeze({order,evidence,realEcDeliveryConfirmed:false});
}
