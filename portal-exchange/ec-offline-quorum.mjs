/** Offline quorum certificate verifier prototype. No networking, issuance or production EC. */
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const digest=async x=>hex(await crypto.subtle.digest('SHA-256',enc.encode(JSON.stringify(x))));
export async function blockCommitment({networkId,height,parentHash,transactionRoot}){
 if(!/^[a-zA-Z0-9_-]{8,80}$/.test(networkId||'')||!Number.isSafeInteger(height)||height<1||! /^[a-f0-9]{64}$/.test(parentHash)||! /^[a-f0-9]{64}$/.test(transactionRoot))throw Error('Invalid test block');
 return digest(['earthchain.offline-quorum.v0',networkId,height,parentHash,transactionRoot]);
}
export async function verifyOfflineQuorum(block,certificate,validators,{threshold}={}){
 if(!Array.isArray(validators)||validators.length<3||!Number.isSafeInteger(threshold)||threshold<=validators.length/2||threshold>validators.length)throw Error('Invalid validator set or quorum');
 const commitment=await blockCommitment(block);
 if(certificate?.commitment!==commitment||!Array.isArray(certificate.signatures))throw Error('Wrong block commitment');
 const allowed=new Map(validators.map(v=>[v.id,v.publicKey]));
 if(allowed.size!==validators.length||certificate.signatures.length>validators.length)throw Error('Invalid signer set');
 const seen=new Set();let valid=0;
 for(const item of certificate.signatures){
  if(!allowed.has(item.id)||seen.has(item.id))throw Error('Unknown or duplicate signer');
  seen.add(item.id);
  const publicKey=allowed.get(item.id);
  if(!publicKey||typeof item.signature!=='string')throw Error('Invalid signature');
  const key=await crypto.subtle.importKey('spki',Uint8Array.from(atob(publicKey),c=>c.charCodeAt(0)),'Ed25519',false,['verify']);
  const ok=await crypto.subtle.verify('Ed25519',key,Uint8Array.from(atob(item.signature),c=>c.charCodeAt(0)),enc.encode(commitment));
  if(!ok)throw Error('Forged validator signature');
  valid++;
 }
 if(valid<threshold)throw Error('Insufficient validator quorum');
 return Object.freeze({verified:true,commitment,validSignatures:valid,threshold,kind:'OFFLINE_TEST_QUORUM_NOT_PRODUCTION_FINALITY'});
}
