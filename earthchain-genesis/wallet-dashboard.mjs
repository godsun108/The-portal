/** Read-only, signed, short-lived ECTEST view from the existing Starfall browser cache.
 * Never reads wallet vault, password, signing key, or bearer token. No network calls.
 */
export async function cachedTestWalletSnapshot({storage=localStorage,now=Date.now()}={}){
 const raw=storage.getItem("earthchain.starfall.hosted.v1");
 if(!raw)return {state:"not_connected"};
 let saved;
 try{saved=JSON.parse(raw)}catch{return {state:"unavailable"}}
 if(!saved?.envelope||!saved?.guard)return {state:"not_connected"};
 if(Number.isSafeInteger(saved.envelope?.view?.expiresAt)&&saved.envelope.view.expiresAt<=now)return {state:"expired"};
 try{
  const {verifyView,starfallSkins}=await import("../games/starfall/commerce/browser-commerce.mjs");
  const configResponse=await fetch("../games/starfall/commerce/hosted-config.json",{cache:"no-store"});
  if(!configResponse.ok)return {state:"config_unavailable"};
  const config=await configResponse.json();
  const view=await verifyView(saved.envelope,{pin:config.pin,guard:saved.guard,now});
  const vaultRaw=storage.getItem("earthchain.no-server.v1");
  const vaultData=vaultRaw?JSON.parse(vaultRaw):null;
  const address=vaultData?.vault?.address;
  if(typeof address!=="string"||!/^ec_[a-f0-9]{32}$/.test(address))return {state:"wallet_unavailable"};
  const balance=view.balances[address];
  if(!Number.isSafeInteger(balance)||balance<0)return {state:"balance_unavailable"};
  const skins=await starfallSkins(view,address);
  return {state:"verified",address,balance,skins:skins.map(s=>({skinId:s.skinId,tokenId:s.tokenId})),expiresAt:view.expiresAt,network:view.config.network};
 }catch{return {state:"stale_or_unverified"}}
}
