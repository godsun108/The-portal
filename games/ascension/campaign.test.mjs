import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLDS,worldFor,nextBoss,bossHealth,campaignComplete} from './campaign.mjs';
test('four worlds advance in order across the ascent',()=>{
 assert.equal(worldFor(0).id,'gothic-bastion');
 assert.equal(worldFor(1200).id,'ashen-expanse');
 assert.equal(worldFor(2400).id,'foundry-orbit');
 assert.equal(worldFor(3600).id,'buried-spire');
 assert.equal(WORLDS.length,4);
});
test('boss gates are authored and difficulty rises',()=>{
 assert.equal(nextBoss(0).boss,'THE WARDEN');
 assert.equal(nextBoss(3).boss,'THE LAST ARCHON');
 assert.equal(nextBoss(4),null);
 assert.ok(bossHealth(3)>bossHealth(0));
});
test('campaign only completes after all four bosses',()=>{
 assert.equal(campaignComplete(3),false);
 assert.equal(campaignComplete(4),true);
});
