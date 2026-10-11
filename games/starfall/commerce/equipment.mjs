import {verifyView,starfallSkins} from './browser-commerce.mjs';
export async function verifiedTestSkin(now=Date.now()){
 try{
  const s=JSON.parse(localStorage.getItem('earthchain.starfall.commerce.v1')||'null'),w=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null');
  if(!s?.envelope||!w?.vault?.address)return null;
  const v=await verifyView(s.envelope,{pin:s.pin,guard:s.guard,now}),skins=await starfallSkins(v,w.vault.address);
  return skins.length?{id:skins[0].skinId,expiresAt:v.expiresAt}:null;
 }catch{return null;}
}
