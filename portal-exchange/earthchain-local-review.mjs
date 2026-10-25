/** Local seller draft review: explicit, non-authorizing status only. */
import {makeSellerDraft,draftValidation} from './earthchain-seller-draft.mjs';
export function buildLocalReview(draft){
 const d=makeSellerDraft(draft),v=draftValidation(d);
 return Object.freeze({listingId:d.id,priceUsdCents:d.priceUsdCents,quantity:d.quantity,condition:d.condition,issues:v.issues,stage:'LOCAL_REVIEW_ONLY',submitted:false,approved:false,publiclyListed:false,canPurchase:false});
}
export function safePreviewFields(draft){
 const d=makeSellerDraft(draft);
 return Object.freeze({listingId:d.id,title:d.title,priceUsd:(d.priceUsdCents/100).toFixed(2),quantity:d.quantity,condition:d.condition,visibility:'LOCAL_PREVIEW_ONLY',canPurchase:false});
}
