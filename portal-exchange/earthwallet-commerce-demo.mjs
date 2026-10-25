/** EarthWallet unified commerce demo. No real balances, token issuance, payment or settlement. */
export const EC_USE_CASES=Object.freeze(['cards','nfts','games','streaming','creators']);
export function makeWalletDemo({walletId='demo-wallet',balanceEC=100}={}){
 if(!/^[a-z0-9-]{1,64}$/.test(walletId)||!Number.isSafeInteger(balanceEC)||balanceEC<0)throw Error('Invalid demo wallet');
 return Object.freeze({walletId,balanceEC,mode:'SIMULATION',canBuyEC:false,canTransfer:false});
}
export function makeCommerceIntent({wallet,category,itemId,priceUsdCents,ecUsdCents,merchantId}){
 if(!wallet||wallet.mode!=='SIMULATION'||!EC_USE_CASES.includes(category)||!/^[a-zA-Z0-9_-]{1,80}$/.test(itemId||'')||!merchantId)throw Error('Invalid demo intent');
 if(!Number.isSafeInteger(priceUsdCents)||priceUsdCents<1||!Number.isSafeInteger(ecUsdCents)||ecUsdCents<1)throw Error('Invalid demo quote');
 // Ceil avoids undercharging a merchant when EC has a fractional conversion.
 const ecMinorUnits=(BigInt(priceUsdCents)*100000000n+BigInt(ecUsdCents)-1n)/BigInt(ecUsdCents);
 if(ecMinorUnits>BigInt(Number.MAX_SAFE_INTEGER))throw Error('Quote overflow');
 return Object.freeze({walletId:wallet.walletId,category,itemId,merchantId,priceUsdCents,ecUsdCents,ecMinorUnits:ecMinorUnits.toString(),ecDecimals:8,quoteSource:'USER_SUPPLIED_DEMO_ONLY',quoteExpiry:null,canPay:false,status:'PREVIEW_ONLY',requires:['verified_market_quote','merchant_consent','legal_clearance','payment_adapter','inventory_or_entitlement']});
}
export function supportedActions(){return Object.freeze({buyEC:'DISABLED',sendEC:'DISABLED',checkout:'DISABLED',cardPurchase:'DEMO',nftPurchase:'DEMO',gamePurchase:'DEMO',streamingAccess:'DEMO',creatorSupport:'DEMO'});}
