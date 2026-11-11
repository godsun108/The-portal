import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedAscensionCosmetics,applyAscensionCosmetic} from './earthchain-bridge.mjs';

test('standalone staging keeps optional wallet cosmetics unavailable',async()=>{
 const result=await verifiedAscensionCosmetics();
 assert.equal(result.state,'unavailable');
 assert.deepEqual(result.cosmetics,[]);
});
test('cosmetics cannot be applied without the verified wallet adapter',()=>{
 const game={};
 assert.equal(applyAscensionCosmetic(game,{id:'solar-lion-armor',label:'Solar Lion',accent:'#ffd078',glow:'#ffb13b'}),false);
 assert.equal(game.cosmetic,undefined);
});
