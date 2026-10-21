// Pure proposed entitlement policy. NOT proof verification or an NFT integration.
export const CHAMPION_SKINS=Object.freeze({starfall:Object.freeze({skinId:'starfall-celestial-crown',name:'Celestial Crown',description:'Gold-and-cosmic-blue championship hull and radiant trail'})});
export function championSkinFromOwnership(p,{gameId,holderWallet,now=Date.now()}={}){
 if(!CHAMPION_SKINS[gameId]||!p||p.schema!=='earthplay.champion-ownership.v1'||p.gameId!==gameId||p.holderWallet!==holderWallet)return null;
 if(p.tokenClass!=='world-record-legacy'||p.verifiedByTrustedService!==true)return null;
 if(typeof p.tokenId!=='string'||!/^[-_a-zA-Z0-9:]{8,128}$/.test(p.tokenId))return null;
 if(!Number.isSafeInteger(p.expiresAt)||p.expiresAt<=now||p.expiresAt>now+3600000)return null;
 // Only call after independently verifying issuer signature and chain ownership.
 return CHAMPION_SKINS[gameId];
}
