/** Resolve a seller's local draft for a private product preview; fail closed. */
import {FOUNDING_CARD} from './earthchain-founding-card.mjs';
import {decodeSellerDraft} from './earthchain-seller-storage.mjs';
import {safePreviewFields} from './earthchain-local-review.mjs';
export function resolveLocalProductPreview(raw){
 const fallback=Object.freeze({listingId:FOUNDING_CARD.id,title:FOUNDING_CARD.title,priceUsd:(FOUNDING_CARD.priceUsdCents/100).toFixed(2),quantity:FOUNDING_CARD.quantity,condition:FOUNDING_CARD.condition,visibility:'PRIVATE_DRAFT',canPurchase:false,source:'CATALOG_DEFAULT'});
 if(raw==null||raw==='')return fallback;
 try{return Object.freeze({...safePreviewFields(decodeSellerDraft(raw)),source:'SAVED_LOCAL_DRAFT',visibility:'PRIVATE_DRAFT',canPurchase:false})}
 catch{return Object.freeze({...fallback,source:'INVALID_LOCAL_DRAFT_IGNORED'})}
}
