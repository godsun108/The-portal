import test from "node:test";
import assert from "node:assert/strict";
import {newMarket,acquireTestCoins,listCard,purchaseCard,shipCard,releaseTestCoins,balance} from "./simulator.mjs";
test("USD-like simulated acquisition to card purchase to seller credits",()=>{
 const m=newMarket();
 acquireTestCoins(m,{buyer:"buyer",credits:100,requestId:"request-001"});
 listCard(m,{id:"card-1",seller:"seller",name:"Blue-Eyes White Dragon",price:75});
 assert.throws(()=>purchaseCard(m,{listingId:"card-1",buyer:"buyer",orderId:"order-001"}),/approval/);
 const o=purchaseCard(m,{listingId:"card-1",buyer:"buyer",orderId:"order-001",approved:true});
 assert.equal(balance(m,"buyer"),25);
 assert.equal(balance(m,"seller"),0);
 assert.deepEqual(purchaseCard(m,{listingId:"card-1",buyer:"buyer",orderId:"order-001",approved:true}),o);
 shipCard(m,"order-001",{tracking:"DEMO-TRACK"});
 releaseTestCoins(m,"order-001",{approved:true});
 assert.equal(balance(m,"seller"),75);
 assert.throws(()=>releaseTestCoins(m,"order-001",{approved:true}),/not eligible/);
});
test("failed purchase leaves balances unchanged",()=>{
 const m=newMarket();listCard(m,{id:"card-1",seller:"seller",name:"Dark Magician",price:50});
 assert.throws(()=>purchaseCard(m,{listingId:"card-1",buyer:"buyer",orderId:"order-002",approved:true}),/Insufficient/);
 assert.equal(m.orders.size,0);assert.equal(m.listings.get("card-1").status,"active");
});
test("cannot reuse acquisition request",()=>{
 const m=newMarket();acquireTestCoins(m,{buyer:"buyer",credits:20,requestId:"request-002"});
 assert.throws(()=>acquireTestCoins(m,{buyer:"buyer",credits:20,requestId:"request-002"}),/Duplicate/);
});
