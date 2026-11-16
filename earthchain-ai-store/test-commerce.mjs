import {demoAgents,validateAgent} from "./catalog.mjs";
export function createTestStore(initialCredits=100){
  if(!Number.isSafeInteger(initialCredits)||initialCredits<0)throw Error("Invalid credits");
  return {credits:initialCredits,orders:[],journal:[],processed:new Set()};
}
export function buyTestAgent(store,{agentId,orderId,approved=false}){
  if(!approved)throw Error("Human approval required");
  if(typeof orderId!=="string"||!/^[a-zA-Z0-9_-]{8,80}$/.test(orderId))throw Error("Invalid order ID");
  if(store.processed.has(orderId))return store.orders.find(o=>o.orderId===orderId);
  const agent=demoAgents.find(a=>a.id===agentId);
  if(!agent)throw Error("Unknown agent");
  validateAgent(agent);
  if(store.credits<agent.price)throw Error("Insufficient test credits");
  const order=Object.freeze({orderId,agentId,amount:agent.price,currency:"ECTEST",status:"settled",simulated:true,permissionsGranted:[]});
  store.credits-=agent.price;
  store.orders.push(order);
  store.journal.push(Object.freeze({orderId,debit:"buyer:ECTEST",credit:"demo:seller:ECTEST",amount:agent.price}));
  store.processed.add(orderId);
  return order;
}
