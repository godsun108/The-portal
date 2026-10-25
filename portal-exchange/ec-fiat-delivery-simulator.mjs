/** Pure simulation of settled-USD -> native EC delivery. No provider, network or money calls. */
import {previewUsdToEc} from './ec-usd-acquisition.mjs';
const ADDRESS=/^ec_[0-9a-f]{32}$/;
export function newAcquisition({id,walletAddress,usdCents,ecUsdCents,feeUsdCents=0}){
 if(!/^[a-zA-Z0-9_-]{4,64}$/.test(id||'')||!ADDRESS.test(walletAddress||''))throw Error('Invalid order or native wallet address');
 const quote=previewUsdToEc({usdCents,ecUsdCents,feeUsdCents});
 return Object.freeze({id,walletAddress,quote,state:'AWAITING_PAYMENT',events:[],deliveryReference:null,mode:'SIMULATION',realMoneyEnabled:false});
}
export function advanceAcquisition(order,{eventId,type,reference=null}){
 if(!/^[a-zA-Z0-9_-]{4,80}$/.test(eventId||''))throw Error('Invalid event ID');
 if(order.events.includes(eventId))return order;
 const transitions={AWAITING_PAYMENT:{PAYMENT_SETTLED:'FUNDS_SETTLED',PAYMENT_FAILED:'PAYMENT_FAILED'},FUNDS_SETTLED:{DELIVERY_REQUESTED:'DELIVERY_PENDING',REFUND_REQUIRED:'REFUND_PENDING'},DELIVERY_PENDING:{DELIVERY_CONFIRMED:'COMPLETE',DELIVERY_FAILED:'DELIVERY_FAILED'},DELIVERY_FAILED:{REFUND_REQUIRED:'REFUND_PENDING'},COMPLETE:{CHARGEBACK:'DISPUTED'},REFUND_PENDING:{REFUND_CONFIRMED:'REFUNDED'}};
 const next=transitions[order.state]?.[type];if(!next)throw Error('Invalid acquisition state transition');
 if(type==='DELIVERY_CONFIRMED'&&(!reference||typeof reference!=='string'||reference.length>128))throw Error('Missing native transfer proof');
 return Object.freeze({...order,state:next,events:Object.freeze([...order.events,eventId]),deliveryReference:type==='DELIVERY_CONFIRMED'?reference:order.deliveryReference,realMoneyEnabled:false});
}
