/** Crypto-agility policy laboratory; policy enforcement only, NOT PQ cryptography. */
export const ALGORITHMS=Object.freeze({
 'ed25519-lab':Object.freeze({kind:'classical',production:false}),
 'ml-dsa-65':Object.freeze({kind:'post-quantum',production:false}),
 'hybrid-ed25519-ml-dsa-65':Object.freeze({kind:'hybrid',production:false})
});
export function validateCryptoEnvelope(envelope,{chainId,purpose,minimum='hybrid',protocolVersion=1}={}){
 if(!envelope||typeof envelope!=='object'||Array.isArray(envelope))throw Error('Invalid envelope');
 if(!['classical','hybrid','post-quantum'].includes(minimum))throw Error('Invalid policy');
 if(envelope.chainId!==chainId||envelope.purpose!==purpose||envelope.protocolVersion!==protocolVersion)throw Error('Domain separation failure');
 const algorithm=ALGORITHMS[envelope.algorithm];
 if(!algorithm)throw Error('Unknown signing algorithm');
 if(minimum==='hybrid'&&algorithm.kind!=='hybrid')throw Error('Hybrid signature required');
 if(minimum==='post-quantum'&&algorithm.kind==='classical')throw Error('Post-quantum signature required');
 if(!Array.isArray(envelope.signatures)||envelope.signatures.length!==(algorithm.kind==='hybrid'?2:1))throw Error('Invalid signature slots');
 if(envelope.signatures.some(s=>!s||typeof s!=='object'||typeof s.keyId!=='string'||!s.keyId||typeof s.signature!=='string'||!s.signature))throw Error('Invalid signature metadata');
 // No cryptographic verification exists here: never treat this as a successful authentication.
 return {policyAccepted:true,cryptographicallyVerified:false,productionAuthorized:false,algorithm:envelope.algorithm};
}
