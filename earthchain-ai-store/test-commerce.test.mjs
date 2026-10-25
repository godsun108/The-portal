import test from "node:test";
import assert from "node:assert/strict";
import {createTestStore,buyTestAgent} from "./test-commerce.mjs";
import {searchAgents} from "./catalog.mjs";
test("search filters agents",()=>assert.equal(searchAgents("music")[0].id,"muse"));
test("purchase requires approval",()=>assert.throws(()=>buyTestAgent(createTestStore(),{agentId:"muse",orderId:"order_12345678"}),/approval/));
test("test purchase balances and deduplicates",()=>{const s=createTestStore(100);const input={agentId:"muse",orderId:"order_12345678",approved:true};const a=buyTestAgent(s,input);assert.equal(buyTestAgent(s,input),a);assert.equal(s.credits,75);assert.equal(s.journal.length,1);assert.equal(a.simulated,true);});
test("insufficient balance does not mutate",()=>{const s=createTestStore(0);assert.throws(()=>buyTestAgent(s,{agentId:"forge",orderId:"order_12345678",approved:true}));assert.equal(s.orders.length,0);assert.equal(s.journal.length,0);});
