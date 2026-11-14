import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedAscensionCosmetics,applyAscensionCosmetic} from './earthchain-bridge.mjs';
import {getAscensionCollectible} from './collectibles.mjs';

test('missing wallet session fails closed without blocking gameplay',async()=>{
 const result=await verifiedAscensionCosmetics();
 assert.equal(result.state,'unavailable');
 assert.deepEqual(result.cosmetics,[]);
});
test('only canonical ASCENSION cosmetics can be projected onto the warrior',()=>{
 const game={},item=getAscensionCollectible('obsidian-regent');
 assert.equal(applyAscensionCosmetic(game,{...item,accent:'#fff'}),false);
 assert.equal(game.cosmetic,undefined);
 assert.equal(applyAscensionCosmetic(game,{
  assetId:item.assetId,tokenId:item.tokenId,label:item.name,
  accent:item.visual.accent,glow:item.visual.glow
 }),true);
 assert.equal(game.cosmetic.tokenId,item.tokenId);
});
test('Starfall token identifiers cannot be passed as ASCENSION cosmetics',()=>{
 const game={};
 assert.equal(applyAscensionCosmetic(game,{assetId:'solar-lion',tokenId:'starfall-solar-lion-deadbeef',label:'Solar Lion',accent:'#fff',glow:'#fff'}),false);
 assert.equal(game.cosmetic,undefined);
});
