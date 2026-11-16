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

import {refundTestOrder} from "./simulator.mjs";
test("refund returns held test credits exactly once",()=>{
 const m=newMarket();
 acquireTestCoins(m,{buyer:"buyer",credits:90,requestId:"request-003"});
 listCard(m,{id:"card-refund",seller:"seller",name:"Dark Magician",price:60});
 purchaseCard(m,{listingId:"card-refund",buyer:"buyer",orderId:"order-refund",approved:true});
 assert.equal(balance(m,"buyer"),30);
 assert.throws(()=>refundTestOrder(m,"order-refund"),/approval/);
 refundTestOrder(m,"order-refund",{approved:true});
 assert.equal(balance(m,"buyer"),90);
 assert.equal(balance(m,"seller"),0);
 assert.throws(()=>refundTestOrder(m,"order-refund",{approved:true}),/not refundable/);
 assert.throws(()=>releaseTestCoins(m,"order-refund",{approved:true}),/not eligible/);
});

test("card set and condition are structured and validated",()=>{
 const m=newMarket();
 const card=listCard(m,{id:"card-set",seller:"seller",name:"Dark Magician",setCode:"LOB-005",condition:"Lightly Played",price:50});
 assert.equal(card.setCode,"LOB-005");
 assert.equal(card.condition,"Lightly Played");
 assert.throws(()=>listCard(m,{id:"bad-card",seller:"seller",name:"Bad",condition:"Perfect",price:50}),/Invalid card details/);
});
