import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
import {ASCENSION_COLLECTIBLES} from './collectibles.mjs';
import {hash,ascensionCollectibles} from '../starfall/commerce/browser-commerce.mjs';

test('ASCENSION equipment requires exact owner and immutable metadata digest',async()=>{
 const address='ec_'+'a'.repeat(32),item=ASCENSION_COLLECTIBLES[0];
 const view={collectibles:{
  [item.tokenId]:{owner:address,metadataHash:await hash(item.metadata)}
 }};
 const owned=await ascensionCollectibles(view,address);
 assert.equal(owned.length,1);
 assert.equal(owned[0].assetId,item.assetId);
 const wrongOwner=await ascensionCollectibles(view,'ec_'+'b'.repeat(32));
 assert.deepEqual(wrongOwner,[]);
 const altered={collectibles:{[item.tokenId]:{owner:address,metadataHash:'0'.repeat(64)}}};
 assert.deepEqual(await ascensionCollectibles(altered,address),[]);
});

test('ASCENSION ownership adapter ignores unknown and non-ASCENSION tokens',async()=>{
 const address='ec_'+'a'.repeat(32);
 const view={collectibles:{
  'starfall-solar-lion-deadbeef':{owner:address,metadataHash:'0'.repeat(64)},
  'ascension-not-in-catalogue':{owner:address,metadataHash:'0'.repeat(64)}
 }};
 assert.deepEqual(await ascensionCollectibles(view,address),[]);
});
