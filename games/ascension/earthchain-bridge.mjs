/**
 * Optional read-only ASCENSION/EarthChain ownership adapter.
 *
 * Dynamic import is deliberate: the standalone staging service is deployed
 * with games/ascension as its filesystem root, so the sibling Starfall wallet
 * module is absent there. On the full Portal origin it is available. A missing
 * adapter must never prevent the game itself from loading.
 */
import {getAscensionCollectible} from './collectibles.mjs';

export async function verifiedAscensionCosmetics(){
  try{
    const session=JSON.parse(localStorage.getItem('earthchain.starfall.hosted.v1')||'null');
    const vault=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null')?.vault;
    if(!session?.pin||!session?.envelope||typeof vault?.address!=='string'){
      return {state:'not_connected',cosmetics:[]};
    }
    const {verifyView,ascensionCollectibles}=await import('../starfall/commerce/browser-commerce.mjs');
    const view=await verifyView(session.envelope,{pin:session.pin,guard:session.guard});
    const cosmetics=await ascensionCollectibles(view,vault.address);
    return {state:'verified',cosmetics};
  }catch{
    return {state:'unavailable',cosmetics:[]};
  }
}

export function applyAscensionCosmetic(game,cosmetic){
  if(!game||!cosmetic||typeof cosmetic!=='object')return false;
  const canonical=getAscensionCollectible(cosmetic.assetId);
  if(!canonical||canonical.tokenId!==cosmetic.tokenId||
     canonical.name!==cosmetic.label||canonical.visual.accent!==cosmetic.accent||
     canonical.visual.glow!==cosmetic.glow)return false;
  game.cosmetic={assetId:canonical.assetId,tokenId:canonical.tokenId,
    label:canonical.name,accent:canonical.visual.accent,glow:canonical.visual.glow};
  return true;
}
