/** No keys generated or persisted. A safe browser-only capability check. */
export async function probeWalletCrypto(cryptoProvider=globalThis.crypto){
 const subtle=cryptoProvider?.subtle;
 if(!subtle || typeof subtle.generateKey!=="function" || typeof subtle.sign!=="function" || typeof subtle.verify!=="function"){
  return {supported:false,reason:"webcrypto_unavailable"};
 }
 try{
  // Ephemeral non-extractable signing key; discarded when this function returns.
  const keys=await subtle.generateKey({name:"Ed25519"},false,["sign","verify"]);
  const payload=new TextEncoder().encode("earthchain-browser-capability-v1");
  const signature=await subtle.sign({name:"Ed25519"},keys.privateKey,payload);
  const verified=await subtle.verify({name:"Ed25519"},keys.publicKey,signature,payload);
  return {supported:verified===true,reason:verified===true?"ed25519_available":"signature_verification_failed"};
 }catch{
  return {supported:false,reason:"ed25519_unsupported"};
 }
}
