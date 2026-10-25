/** Offline seller draft editor. Never publishes, charges, or stores seller credentials. */
import {FOUNDING_CARD} from './earthchain-founding-card.mjs';
const CONDITIONS=Object.freeze(['UNVERIFIED','NM','LP','MP','HP','DMG']);
export function makeSellerDraft({priceUsdCents=FOUNDING_CARD.priceUsdCents,quantity=FOUNDING_CARD.quantity,condition='UNVERIFIED',notes=''}={}){
 if(!Number.isSafeInteger(priceUsdCents)||priceUsdCents<1||priceUsdCents>100000000)throw Error('Invalid price');
 if(!Number.isSafeInteger(quantity)||quantity<0||quantity>10000)throw Error('Invalid quantity');
 if(!CONDITIONS.includes(condition))throw Error('Invalid condition');
 if(typeof notes!=='string'||notes.length>500)throw Error('Invalid notes');
 return Object.freeze({id:FOUNDING_CARD.id,title:FOUNDING_CARD.title,priceUsdCents,quantity,condition,notes,visibility:'LOCAL_PREVIEW_ONLY',canPublish:false,canSell:false});
}
export function draftValidation(draft){
 const issues=[];
 if(draft.quantity<1)issues.push('stock_required');
 if(draft.condition==='UNVERIFIED')issues.push('condition_confirmation');
 issues.push('seller_identity_verification','photo_publication_permission','fulfillment_and_returns','payment_and_compliance_approval');
 return Object.freeze({readyToPublish:false,issues,canPublish:false});
}
