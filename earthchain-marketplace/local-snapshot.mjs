import {newMarket} from './simulator.mjs';
export const SNAPSHOT_KEY='earthchain.marketplace.ectest.demo.v1';
export function serializeMarket(m){return JSON.stringify({version:1,currency:'ECTEST',simulated:true,wallets:[...m.wallets],listings:[...m.listings],orders:[...m.orders],events:m.events});}
export function restoreMarket(raw){
 const d=JSON.parse(raw);
 if(!d||d.version!==1||d.currency!=='ECTEST'||d.simulated!==true||!Array.isArray(d.wallets)||!Array.isArray(d.listings)||!Array.isArray(d.orders)||!Array.isArray(d.events)||d.wallets.length>1000||d.listings.length>1000||d.orders.length>1000||d.events.length>10000)throw Error('Invalid demo snapshot');
 const m=newMarket();
 for(const [id,value] of d.wallets){if(typeof id!=='string'||!id||!Number.isSafeInteger(value)||value<0||m.wallets.has(id))throw Error('Invalid wallet');m.wallets.set(id,value)}
 for(const [id,l] of d.listings){if(typeof id!=='string'||!l||l.id!==id||typeof l.seller!=='string'||typeof l.name!=='string'||!Number.isSafeInteger(l.price)||l.price<=0||l.currency!=='ECTEST'||!['active','sold'].includes(l.status)||m.listings.has(id))throw Error('Invalid listing');m.listings.set(id,l)}
 for(const [id,o] of d.orders){const l=m.listings.get(o?.listingId);if(typeof id!=='string'||!l||o.orderId!==id||o.seller!==l.seller||o.amount!==l.price||o.simulated!==true||!['awaiting_shipment','shipped','settled','refunded'].includes(o.status)||m.orders.has(id))throw Error('Invalid order');m.orders.set(id,o)}
 for(const e of d.events){if(!e||typeof e.type!=='string')throw Error('Invalid event')};m.events=d.events;
 return m;
}
export function loadDemo(storage){const raw=storage.getItem(SNAPSHOT_KEY);return raw?restoreMarket(raw):newMarket()}
export function saveDemo(m,storage){storage.setItem(SNAPSHOT_KEY,serializeMarket(m))}
