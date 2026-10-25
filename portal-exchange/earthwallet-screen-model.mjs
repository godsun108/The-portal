/** EarthWallet checkout presentation model, deterministic and offline. */
import {EC_USE_CASES,makeWalletDemo,makeCommerceIntent} from './earthwallet-commerce-demo.mjs';
export const EARTHWALLET_NAV=Object.freeze([{id:'cards',label:'Shop cards'},{id:'nfts',label:'Collect NFTs'},{id:'games',label:'Play games'},{id:'streaming',label:'Watch PORTAL'},{id:'creators',label:'Support creators'}]);
export function buildWalletScreen({wallet=makeWalletDemo(),category='cards',itemId='demo-card',merchantId='demo-seller',priceUsdCents=2000,ecUsdCents=100}={}){
 if(!EC_USE_CASES.includes(category))throw Error('Unknown category');
 const quote=makeCommerceIntent({wallet,category,itemId,merchantId,priceUsdCents,ecUsdCents});
 const ecAmount=(Number(quote.ecMinorUnits)/1e8).toFixed(8);
 return Object.freeze({title:'EarthWallet',wallet:{id:wallet.walletId,balanceEC:wallet.balanceEC,mode:'DEMO'},navigation:EARTHWALLET_NAV,checkout:{category,itemId,merchantId,displayPriceUsd:(priceUsdCents/100).toFixed(2),displayEarthCash:(priceUsdCents/100).toFixed(2),displayEarthCoin:ecAmount,quoteType:'ILLUSTRATIVE_NOT_MARKET_RATE',quoteExpiry:null,canPay:false},actions:{buyEC:{label:'Buy EC',enabled:false,reason:'Payment provider and issuance clearance required'},checkout:{label:'Pay with EC',enabled:false,reason:'No live market quote or settlement adapter'}}});
}
