/** Offline treasury solvency checks. No real accounts or custody. Amounts in integer minor units. */
const valid=n=>Number.isSafeInteger(n)&&n>=0;
export function assessSafeguarding({confirmedAssets,customerLiabilities,pendingWithdrawals=0,refundObligations=0}){
 const values=[confirmedAssets,customerLiabilities,pendingWithdrawals,refundObligations];
 if(!values.every(valid))throw Error('Invalid treasury amount');
 const owed=customerLiabilities+pendingWithdrawals+refundObligations;
 if(!Number.isSafeInteger(owed))throw Error('Treasury liability overflow');
 return Object.freeze({solvent:confirmedAssets>=owed,confirmedAssets,required:owed,shortfall:Math.max(0,owed-confirmedAssets),withdrawalsEnabled:false,simulated:true});
}
export function assessAssetBuckets(buckets){
 if(!buckets||typeof buckets!=='object'||Array.isArray(buckets)||Object.keys(buckets).length===0)throw Error('Invalid buckets');
 const results=Object.fromEntries(Object.entries(buckets).map(([asset,amounts])=>[asset,assessSafeguarding(amounts)]));
 return Object.freeze({results,allSolvent:Object.values(results).every(x=>x.solvent),withdrawalsEnabled:false,simulated:true});
}
