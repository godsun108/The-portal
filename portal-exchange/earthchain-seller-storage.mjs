/** Explicit local-only draft persistence codec; storage is handled by the browser UI. */
import {makeSellerDraft,draftValidation} from './earthchain-seller-draft.mjs';
export const DRAFT_STORAGE_KEY='earthchain:local:EC-YGO-0001:v1';
export function encodeSellerDraft(draft){
 const validated=makeSellerDraft(draft);
 return JSON.stringify({version:1,id:validated.id,priceUsdCents:validated.priceUsdCents,quantity:validated.quantity,condition:validated.condition,notes:validated.notes});
}
export function decodeSellerDraft(raw){
 if(typeof raw!=='string'||raw.length>4096)throw Error('Invalid saved draft');
 const parsed=JSON.parse(raw);
 if(!parsed||parsed.version!==1||parsed.id!=='EC-YGO-0001')throw Error('Unsupported draft');
 return makeSellerDraft(parsed);
}
export function sellerReviewPacket(draft){
 const validated=makeSellerDraft(draft),review=draftValidation(validated);
 return Object.freeze({schemaVersion:1,listingId:validated.id,askingPriceUsdCents:validated.priceUsdCents,quantity:validated.quantity,condition:validated.condition,notes:validated.notes,reviewIssues:review.issues,requestStatus:'PREVIEW_ONLY',submissionEnabled:false,publicationEnabled:false,paymentEnabled:false});
}
