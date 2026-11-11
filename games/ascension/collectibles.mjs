/**
 * ASCENSION collectible catalogue v1.
 *
 * Canonical game-side definitions only. This file does not mint, sell, or
 * prove ownership of a token. Issuance must come from the trusted EarthChain
 * authority after a server-verified achievement or approved sale.
 * All items are cosmetic/identity collectibles; gameplay modifiers are zero.
 */
export const ASCENSION_ASSET_SCHEMA='earthchain.game-collectible.v1';
export const ASCENSION_GAME_ID='ascension';

const cosmetic=(id,name,kind,rarity,acquisition,visual,extra={})=>Object.freeze({
  schema:ASCENSION_ASSET_SCHEMA,
  gameId:ASCENSION_GAME_ID,
  tokenId:'ascension-'+id,
  assetId:id,
  name,
  kind,
  rarity,
  acquisition:Object.freeze(acquisition),
  visual:Object.freeze(visual),
  gameplay:Object.freeze({damage:0,armor:0,boost:0,pulse:0,scoreMultiplier:0}),
  ...extra
});

export const ASCENSION_COLLECTIBLES=Object.freeze([
  cosmetic('sealbreaker-crest','Sealbreaker Crest','emblem','rare',
    {type:'earnable',rule:'campaign_bosses_defeated',required:4},
    {accent:'#c99a5a',glow:'#ffd18a',slot:'emblem'}),
  cosmetic('relic-warden','Relic Warden','armor-trim','epic',
    {type:'earnable',rule:'verified_relics_collected',required:100},
    {accent:'#7bb5a6',glow:'#b4f2dc',slot:'armor'}),
  cosmetic('ascended-halo','Ascended Halo','helmet-aura','legendary',
    {type:'earnable',rule:'campaign_completed',required:1},
    {accent:'#d5b5f2',glow:'#f0dcff',slot:'helmet'}),
  cosmetic('obsidian-regent','Obsidian Regent','armor-skin','limited',
    {type:'purchase',edition:'limited',editionLimit:250,priceQuote:'issuer-defined'},
    {accent:'#c18b55',glow:'#ffca7a',slot:'armor'}),
  cosmetic('ashen-phoenix','Ashen Phoenix','jet-trail','limited',
    {type:'purchase',edition:'limited',editionLimit:150,priceQuote:'issuer-defined'},
    {accent:'#dc7652',glow:'#ffc18b',slot:'jet-trail'}),
  cosmetic('buried-crown','Crown of the Buried','helmet-skin','mythic',
    {type:'purchase',edition:'limited',editionLimit:50,priceQuote:'issuer-defined'},
    {accent:'#b99be0',glow:'#e7d3ff',slot:'helmet'})
]);

export function getAscensionCollectible(assetId){
  return ASCENSION_COLLECTIBLES.find(item=>item.assetId===assetId)||null;
}

export function validateAscensionCollectible(item){
  if(!item||item.schema!==ASCENSION_ASSET_SCHEMA||item.gameId!==ASCENSION_GAME_ID)return false;
  const canonical=getAscensionCollectible(item.assetId);
  if(!canonical||canonical.tokenId!==item.tokenId||canonical.name!==item.name)return false;
  if(JSON.stringify(canonical.acquisition)!==JSON.stringify(item.acquisition))return false;
  if(JSON.stringify(canonical.gameplay)!==JSON.stringify(item.gameplay))return false;
  return true;
}

/**
 * Achievement rules are policy descriptors, not client-side mint authority.
 * A future issuer must evaluate them against an authoritative replay/event
 * record and bind the resulting issuance to the player's authenticated wallet.
 */
export const ASCENSION_REWARD_POLICY=Object.freeze({
  schema:'ascension.reward-policy.v1',
  evidenceRequired:'server-verified-run',
  walletBindingRequired:'fresh-wallet-signature',
  issuanceAuthority:'trusted-earthchain-issuer',
  clientScoreMayMint:false,
  localStorageMayMint:false,
  rewardsAreTransferable:true,
  competitiveAdvantage:false
});
