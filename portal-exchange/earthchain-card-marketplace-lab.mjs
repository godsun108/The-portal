/** EarthChain card marketplace checkout lab.
 * No payment processing, custody, asset issuance or merchant fulfillment.
 * Prices in integer cents; EC quotation deliberately unavailable until approved.
 */
export function createCardListing({id,title,condition,priceCents,quantity,sellerId,licensedImage=false}){
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(id||'')||!title||typeof title!=='string'||title.length>200)throw Error('Invalid listing');
 if(!['NM','LP','MP','HP','DMG','SEALED'].includes(condition)||!Number.isSafeInteger(priceCents)||priceCents<1||!Number.isSafeInteger(quantity)||quantity<0||!sellerId)throw Error('Invalid listing terms');
 return Object.freeze({id,title,condition,priceCents,quantity,sellerId,licensedImage:Boolean(licensedImage),status:'DEMO_ONLY'});
}
export function quoteCardOrder({listing,quantity,shippingCents=0,taxCents=0}){
 if(!listing||listing.status!=='DEMO_ONLY'||!Number.isSafeInteger(quantity)||quantity<1||quantity>listing.quantity)throw Error('Invalid demo order');
 if(!Number.isSafeInteger(shippingCents)||shippingCents<0||!Number.isSafeInteger(taxCents)||taxCents<0)throw Error('Invalid charges');
 const subtotalCents=listing.priceCents*quantity,totalCents=subtotalCents+shippingCents+taxCents;
 if(!Number.isSafeInteger(totalCents))throw Error('Amount overflow');
 return Object.freeze({listingId:listing.id,quantity,subtotalCents,shippingCents,taxCents,totalCents,currency:'USD',earthcoinQuote:null,paymentStatus:'UNAVAILABLE',orderStatus:'SIMULATION',canPay:false});
}
export function purchaseReadiness(gates={}){
 const required=['issuerLegalReview','tokenClassificationReview','paymentProviderApproved','custodyAndSecurityReviewed','sellerOnboarding','taxAndConsumerPolicies','refundAndDisputeFlow','fulfillmentAndInventory','liveTransactionAdapterReviewed'];
 const missing=required.filter(k=>gates[k]!==true);
 // A document checklist can never itself enable a payment or token sale.
 return {required,missing,readyForLegalAndTechnicalReview:missing.length===0,canPurchaseEarthCoin:false,canCheckout:false};
}
