/** USD-to-EC acquisition readiness. This module never accepts money or issues coins. */
export const EC_ACQUISITION_GATES=Object.freeze(['native_ec_network_and_issuance_verified','issuer_and_token_legal_review','approved_fiat_payment_and_conversion_provider','customer_identity_and_sanctions_controls','auditable_ec_inventory_and_delivery','market_rate_and_fee_disclosures','refund_chargeback_and_reconciliation_controls','wallet_security_and_transaction_monitoring']);
export function previewUsdToEc({usdCents,ecUsdCents,feeUsdCents=0}){
 if(!Number.isSafeInteger(usdCents)||usdCents<1||!Number.isSafeInteger(ecUsdCents)||ecUsdCents<1||!Number.isSafeInteger(feeUsdCents)||feeUsdCents<0||feeUsdCents>=usdCents)throw Error('Invalid illustrative conversion');
 const net=BigInt(usdCents-feeUsdCents),units=net*100000000n/BigInt(ecUsdCents);
 if(units<1n)throw Error('Amount below EC precision');
 return Object.freeze({usdCents,feeUsdCents,netUsdCents:usdCents-feeUsdCents,ecUsdCents,ecMinorUnits:units.toString(),ecDecimals:8,rateSource:'MANUAL_ILLUSTRATION_NOT_MARKET_PRICE',status:'PREVIEW_ONLY',paymentEnabled:false,ecDeliveryEnabled:false});
}
export function assessEcAcquisitionReadiness(evidence={}){
 const present=EC_ACQUISITION_GATES.filter(g=>evidence[g]===true);
 return Object.freeze({gates:EC_ACQUISITION_GATES,documentedClaims:present,unverified:EC_ACQUISITION_GATES.filter(g=>evidence[g]!==true),readyForIndependentReview:present.length===EC_ACQUISITION_GATES.length,liveEnabled:false,canAcceptUsd:false,canDeliverEC:false});
}
