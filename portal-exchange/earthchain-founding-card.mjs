/** EarthChain founding card: private draft catalog record. No live offer or payment. */
export const FOUNDING_CARD=Object.freeze({
 id:'EC-YGO-0001',category:'cards',title:'Exodia the Forbidden One',
 game:'Yu-Gi-Oh! TCG',set:'Legendary Collection 3: Yugi\'s World',
 cardNumber:'LCYW-EN306',rarity:'Secret Rare',edition:'Unlimited (photo-based, unverified)',
 condition:'Unverified; visually estimated NM–LP',conditionCode:null,
 quantity:1,priceUsdCents:1499,currency:'USD',
 merchantId:'founding-seller-pending-verification',
 authenticity:'NOT_VERIFIED',inventoryVerification:'SELLER_REPORTED_ONLY',
 photoAssets:[],photoStatus:'USER_PROVIDED_IN_CHAT_NOT_PUBLISHED',
 status:'DRAFT_PRIVATE',publiclyListed:false,canPurchase:false,canPayEC:false,
 priceReference:'Provisional asking price, not a guaranteed market value',
 notes:'Photos were provided in conversation; do not publish without explicit photo upload and approval. Seller identification, shipping, returns, taxes and payment processing pending.'
});
export function foundingCardPreview(){return Object.freeze({id:FOUNDING_CARD.id,title:FOUNDING_CARD.title,cardNumber:FOUNDING_CARD.cardNumber,priceUsd:(FOUNDING_CARD.priceUsdCents/100).toFixed(2),condition:FOUNDING_CARD.condition,status:FOUNDING_CARD.status,canPurchase:false});}
