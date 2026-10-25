/** EarthChain valueless simulation: balanced postings and evidence-backed stewardship awards. */
export const ASSETS=Object.freeze(['eUSD_DEMO','EC_DEMO','SOIL_DEMO','STEWARD_DEMO']);
export function newCore(){return {journal:[],claims:new Map(),next:1};}
const valid=s=>typeof s==='string'&&s.trim().length>0&&s.length<=160;
export function balance(core,account,asset){return core.journal.reduce((n,tx)=>n+tx.postings.filter(p=>p.account===account&&p.asset===asset).reduce((m,p)=>m+p.delta,0),0);}
export function post(core,{reference,postings,kind='transfer'}){
 if(!valid(reference)||core.journal.some(t=>t.reference===reference))throw Error('Duplicate or invalid reference');
 if(!Array.isArray(postings)||postings.length<2)throw Error('Two postings required');
 const sums=new Map(),changes=new Map();
 for(const p of postings){
  if(!valid(p.account)||!ASSETS.includes(p.asset)||!Number.isSafeInteger(p.delta)||p.delta===0)throw Error('Invalid posting');
  sums.set(p.asset,(sums.get(p.asset)||0)+p.delta);
  const key=JSON.stringify([p.account,p.asset]);changes.set(key,(changes.get(key)||0)+p.delta);
 }
 if([...sums.values()].some(n=>n!==0||!Number.isSafeInteger(n)))throw Error('Unbalanced journal');
 for(const [key,delta] of changes){const [account,asset]=JSON.parse(key);if(account!=='ISSUER'&&(balance(core,account,asset)+delta<0||!Number.isSafeInteger(balance(core,account,asset)+delta)))throw Error('Insufficient balance or overflow');}
 const tx=Object.freeze({id:core.next++,reference,kind,simulated:true,postings:postings.map(p=>Object.freeze({...p}))});
 core.journal.push(tx);return tx;
}
export function issueDemo(core,{to,asset,amount,reference}){
 if(!valid(to)||to==='ISSUER'||!Number.isSafeInteger(amount)||amount<=0)throw Error('Invalid issuance');
 return post(core,{reference,kind:'demo_issuance',postings:[{account:'ISSUER',asset,delta:-amount},{account:to,asset,delta:amount}]});
}
export function transferDemo(core,{from,to,asset,amount,reference}){
 if(!valid(from)||!valid(to)||from===to||from==='ISSUER'||to==='ISSUER'||!Number.isSafeInteger(amount)||amount<=0)throw Error('Invalid transfer');
 return post(core,{reference,postings:[{account:from,asset,delta:-amount},{account:to,asset,delta:amount}]});
}
export function submitClaim(core,{claimId,steward,activity,evidenceRef}){
 if(![claimId,steward,activity,evidenceRef].every(valid)||core.claims.has(claimId))throw Error('Invalid or duplicate claim');
 const claim={claimId,steward,activity,evidenceRef,status:'submitted',simulated:true};core.claims.set(claimId,claim);return {...claim};
}
export function approveClaim(core,{claimId,reviewer,amount}){
 const claim=core.claims.get(claimId);
 if(!claim||claim.status!=='submitted'||!valid(reviewer)||reviewer===claim.steward||!Number.isSafeInteger(amount)||amount<=0)throw Error('Claim not approvable');
 const tx=issueDemo(core,{to:claim.steward,asset:'STEWARD_DEMO',amount,reference:'steward:'+claimId});
 claim.status='approved';claim.reviewer=reviewer;claim.rewardReference=tx.reference;return {...claim};
}
export function rejectClaim(core,{claimId,reviewer}){
 const claim=core.claims.get(claimId);
 if(!claim||claim.status!=='submitted'||!valid(reviewer)||reviewer===claim.steward)throw Error('Claim not rejectable');
 claim.status='rejected';claim.reviewer=reviewer;return {...claim};
}
