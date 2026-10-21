import test from 'node:test';import assert from 'node:assert/strict';
import {championIssueIntent} from './champion-issuer-bridge.mjs';
import {starfallSkins} from './commerce/browser-commerce.mjs';
const e={schema:'earthplay.world-record-event.v1',gameId:'starfall',season:'pilot-1',serverSequence:42,score:511,eventId:'starfall:pilot-1:42',status:'PROPOSED_TEST_AWARD_NOT_MINTED'};
const wallet='ec_'+'a'.repeat(32);
test('award metadata resolves through existing skin ownership',async()=>{
 const intent=await championIssueIntent(e,{walletAddress:wallet,verifiedAward:true,verifiedWalletBinding:true});
 assert.equal(intent.status,'PENDING_TRUSTED_ISSUER_NOT_MINTED');
 const view={collectibles:{[intent.tokenId]:{owner:wallet,metadataHash:intent.metadataHash}}};
 assert.deepEqual(await starfallSkins(view,wallet),[{skinId:'starfall-celestial-crown',tokenId:intent.tokenId}]);
});
test('unverified awards rejected',async()=>{
 await assert.rejects(championIssueIntent(e,{walletAddress:wallet,verifiedAward:false,verifiedWalletBinding:true}));
 await assert.rejects(championIssueIntent(e,{walletAddress:wallet,verifiedAward:true,verifiedWalletBinding:false}));
});
