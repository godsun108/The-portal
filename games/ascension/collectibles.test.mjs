import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ASCENSION_COLLECTIBLES,ASCENSION_REWARD_POLICY,
  getAscensionCollectible,validateAscensionCollectible
} from './collectibles.mjs';

test('catalogue IDs are unique and bound to ASCENSION metadata',()=>{
 const ids=ASCENSION_COLLECTIBLES.map(x=>x.tokenId);
 assert.equal(new Set(ids).size,ids.length);
 for(const item of ASCENSION_COLLECTIBLES){
  assert.equal(item.schema,'earthchain.game-collectible.v1');
  assert.equal(item.gameId,'ascension');
  assert.equal(validateAscensionCollectible(item),true);
 }
});

test('all ASCENSION collectibles are cosmetic with no gameplay advantage',()=>{
 for(const item of ASCENSION_COLLECTIBLES){
  assert.deepEqual(item.gameplay,{damage:0,armor:0,boost:0,pulse:0,scoreMultiplier:0});
 }
 assert.equal(ASCENSION_REWARD_POLICY.competitiveAdvantage,false);
});

test('earnable rewards require campaign/relic accomplishments, not local minting',()=>{
 const earned=ASCENSION_COLLECTIBLES.filter(x=>x.acquisition.type==='earnable');
 assert.equal(earned.length,3);
 assert.ok(earned.some(x=>x.acquisition.rule==='campaign_bosses_defeated'&&x.acquisition.required===4));
 assert.ok(earned.some(x=>x.acquisition.rule==='campaign_completed'));
 assert.equal(ASCENSION_REWARD_POLICY.clientScoreMayMint,false);
 assert.equal(ASCENSION_REWARD_POLICY.localStorageMayMint,false);
});

test('limited drops declare finite edition caps but do not invent prices',()=>{
 const drops=ASCENSION_COLLECTIBLES.filter(x=>x.acquisition.type==='purchase');
 assert.equal(drops.length,3);
 for(const item of drops){
  assert.ok(Number.isSafeInteger(item.acquisition.editionLimit));
  assert.ok(item.acquisition.editionLimit>0);
  assert.equal(item.acquisition.priceQuote,'issuer-defined');
 }
});

test('unknown or altered collectible metadata is rejected',()=>{
 assert.equal(getAscensionCollectible('not-real'),null);
 const altered={...ASCENSION_COLLECTIBLES[0],tokenId:'ascension-forged'};
 assert.equal(validateAscensionCollectible(altered),false);
});
