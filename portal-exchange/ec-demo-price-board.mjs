/** Illustrative EC/USD pricing board. NOT an offer, market rate, or redeemable quote. */
import {previewUsdToEc} from './ec-usd-acquisition.mjs';
export const DEMO_USD_AMOUNTS=Object.freeze([500,1000,2500,5000,10000]);
export const DEMO_EC_RATE_SCENARIOS=Object.freeze([
 Object.freeze({id:'low',ecUsdCents:50,label:'Scenario A: $0.50 per EC'}),
 Object.freeze({id:'middle',ecUsdCents:100,label:'Scenario B: $1.00 per EC'}),
 Object.freeze({id:'high',ecUsdCents:200,label:'Scenario C: $2.00 per EC'})
]);
export function demoPricingBoard({scenario='middle',feeUsdCents=0}={}){
 const rate=DEMO_EC_RATE_SCENARIOS.find(x=>x.id===scenario);
 if(!rate)throw Error('Unknown hypothetical rate');
 if(!Number.isSafeInteger(feeUsdCents)||feeUsdCents<0||feeUsdCents>=DEMO_USD_AMOUNTS[0])throw Error('Invalid hypothetical fee');
 return Object.freeze({scenario:rate.id,rateLabel:rate.label,ecUsdCents:rate.ecUsdCents,feeUsdCents,rows:Object.freeze(DEMO_USD_AMOUNTS.map(usdCents=>Object.freeze(previewUsdToEc({usdCents,ecUsdCents:rate.ecUsdCents,feeUsdCents})))),mode:'SIMULATION',isMarketPrice:false,canBuy:false,canRedeem:false});
}
