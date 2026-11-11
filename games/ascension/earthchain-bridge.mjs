/**
 * Optional read-only Starfall/EarthChain cosmetic adapter.
 *
 * The standalone ASCENSION staging service is deployed from games/ascension
 * as its own filesystem root. The Portal wallet adapter lives outside that
 * root, so importing it statically prevents the entire game module from
 * loading (and used to make BEGIN ASCENT appear dead).
 *
 * Keep gameplay independent of this optional integration. When the wallet
 * adapter is explicitly bundled into this service, it can be connected here
 * without making the core game depend on it.
 */
export async function verifiedAscensionCosmetics(){
  return {state:'unavailable',cosmetics:[]};
}

export function applyAscensionCosmetic(game,cosmetic){
  if(!game||!cosmetic||typeof cosmetic!=='object')return false;
  game.cosmetic={...cosmetic};
  return true;
}
