import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedAscensionCosmetics,applyAscensionCosmetic} from './earthchain-bridge.mjs';

test('missing wallet proof fails closed without inventing ownership',async()=>{
 const storage={getItem:()=>null};
 const result=await verifiedAscensionCosmetics({storage,fetcher:async()=>{throw Error('must not fetch')}});
 assert.equal(result.state,'not_connected');
 assert.deepEqual(result.cosmetics,[]);
});
test('malformed wallet state fails closed',async()=>{
 const storage={getItem:key=>key==='earthchain.starfall.hosted.v1'?'not-json':null};
 const result=await verifiedAscensionCosmetics({storage,fetcher:async()=>({ok:true,json:async()=>({})})});
 assert.equal(result.state,'unavailable');
 assert.deepEqual(result.cosmetics,[]);
});
test('only a known verified crossover cosmetic can be applied',()=>{
 const game={};
 assert.equal(applyAscensionCosmetic(game,{id:'made-up',accent:'#fff'}),false);
 assert.equal(applyAscensionCosmetic(game,{id:'solar-lion-armor',label:'Solar Lion',accent:'#ffd078',glow:'#ffb13b'}),true);
 assert.equal(game.cosmetic.id,'solar-lion-armor');
});
