/** Portable, tamper-evident offline validator safety-state snapshot.
 * Caller must durably save the returned bytes BEFORE signing. No I/O is performed.
 * Hashes are corruption detection, not authentication against malicious rollback.
 */
const enc=new TextEncoder(),hex=/^[a-f0-9]{64}$/;
const sha=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
export function validateOfflineSafetyState(s){
 if(!s||s.schema!=='earthchain.offline.validator-safety.v0'||!/^[a-zA-Z0-9_-]{8,80}$/.test(s.networkId||'')||!/^[a-zA-Z0-9_-]{1,64}$/.test(s.validatorId||'')||!Number.isSafeInteger(s.height)||s.height<1||!Number.isSafeInteger(s.lastRound)||s.lastRound< -1||!Array.isArray(s.signed)||s.signed.length>10000)throw Error('Invalid safety state');
 const seen=new Map();
 for(const v of s.signed){
  if(!Number.isSafeInteger(v?.height)||v.height<1||!Number.isSafeInteger(v.round)||v.round<0||!['PREPARE','COMMIT'].includes(v.phase)||!hex.test(v.commitment))throw Error('Invalid signing history');
  const key=[v.height,v.round,v.phase].join(':');
  if(seen.has(key)&&seen.get(key)!==v.commitment)throw Error('Conflicting signing history');
  seen.set(key,v.commitment);
 }
 return true;
}
export function initialOfflineSafetyState({networkId,validatorId,height=1}){
 const s={schema:'earthchain.offline.validator-safety.v0',networkId,validatorId,height,lastRound:-1,signed:[]};validateOfflineSafetyState(s);return s;
}
export function stageOfflineSafetyVote(state,{height,round,phase,commitment}){
 validateOfflineSafetyState(state);
 if(height!==state.height||round<state.lastRound)throw Error('Unsafe height or round regression');
 const signed=[...state.signed,{height,round,phase,commitment}],next={...state,lastRound:Math.max(round,state.lastRound),signed};validateOfflineSafetyState(next);return next;
}
export async function exportOfflineSafetySnapshot(state){
 validateOfflineSafetyState(state);
 const payload=JSON.stringify(state);
 return JSON.stringify({payload,sha256:await sha(payload)});
}
export async function importOfflineSafetySnapshot(snapshot,{networkId,validatorId,minLastRound=-1}={}){
 if(typeof snapshot!=='string'||snapshot.length>2000000)throw Error('Invalid snapshot');
 const doc=JSON.parse(snapshot);
 if(typeof doc.payload!=='string'||!hex.test(doc.sha256)||await sha(doc.payload)!==doc.sha256)throw Error('Snapshot checksum mismatch');
 const state=JSON.parse(doc.payload);validateOfflineSafetyState(state);
 if(state.networkId!==networkId||state.validatorId!==validatorId||state.lastRound<minLastRound)throw Error('Wrong identity or rollback detected');
 return state;
}
