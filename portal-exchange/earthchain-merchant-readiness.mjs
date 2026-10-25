/** EarthChain commerce readiness: merchant and product validation (offline only).
 * No checkout, token issuance, seller verification or payments are performed.
 */
export function validateMerchant(input){
 const issues=[];
 if(!input||typeof input!=='object')throw Error('Merchant required');
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(input.id||''))issues.push('merchant_id');
 if(typeof input.legalName!=='string'||!input.legalName.trim())issues.push('legal_name');
 if(typeof input.contactEmail!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail))issues.push('contact_email');
 if(input.identityVerified!==true)issues.push('identity_verification');
 if(input.paymentProviderApproved!==true)issues.push('payment_provider');
 if(input.refundPolicyAccepted!==true)issues.push('refund_policy');
 if(input.shippingPolicyAccepted!==true)issues.push('shipping_policy');
 return Object.freeze({merchantId:input.id||null,readyForReview:issues.length===0,missing:issues,approved:false,canSell:false});
}
export function validatePhysicalCardListing(input,merchant){
 if(!input||typeof input!=='object')throw Error('Listing required');
 const issues=[];
 if(!merchant||merchant.approved!==true)issues.push('approved_merchant');
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(input.id||''))issues.push('listing_id');
 if(typeof input.title!=='string'||!input.title.trim())issues.push('title');
 if(!['NM','LP','MP','HP','DMG','SEALED'].includes(input.condition))issues.push('condition');
 if(!Number.isSafeInteger(input.priceCents)||input.priceCents<1)issues.push('price');
 if(!Number.isSafeInteger(input.stock)||input.stock<1)issues.push('inventory');
 if(input.authenticityAttested!==true)issues.push('authenticity_attestation');
 if(input.imageRightsConfirmed!==true)issues.push('image_rights');
 if(input.fulfillmentPlanConfirmed!==true)issues.push('fulfillment');
 return Object.freeze({listingId:input.id||null,missing:issues,readyForReview:issues.length===0,approved:false,canPurchase:false});
}
export const EARTHCHAIN_LAUNCH_SEQUENCE=Object.freeze([
 'merchant identity and payment-provider approval',
 'authentic card inventory, image rights and fulfillment',
 'USD payment, refunds and dispute operations',
 'EarthCoin legal classification and issuance approval',
 'regulated EC acquisition and reliable price quotations',
 'wallet security, transaction monitoring and merchant settlement',
 'controlled live checkout only after independent authorization'
]);
