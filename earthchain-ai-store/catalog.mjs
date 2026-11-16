export const demoAgents = Object.freeze([
  {id:"muse",name:"Muse AI",category:"creative",description:"Music workflow assistant",price:25,permissions:[]},
  {id:"forge",name:"Forge AI",category:"development",description:"Coding and testing assistant",price:40,permissions:[]},
  {id:"merchant",name:"Merchant AI",category:"commerce",description:"Product listing assistant",price:20,permissions:[]}
]);
export function validateAgent(agent){
  if(!agent || !/^[a-z][a-z0-9-]{1,63}$/.test(agent.id) || typeof agent.name!=="string" || agent.name.length>100 || !Number.isSafeInteger(agent.price) || agent.price<0 || !Array.isArray(agent.permissions)) throw Error("Invalid agent");
  return agent;
}
export function searchAgents(query="",category="all"){
  const q=String(query).toLowerCase().trim();
  return demoAgents.filter(a=>(category==="all"||a.category===category)&&[a.name,a.description,a.category].some(v=>v.toLowerCase().includes(q)));
}
