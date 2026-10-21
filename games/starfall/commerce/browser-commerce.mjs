// Browser adapter for signed coordinator TEST attestations. No network calls or key storage.
export const SCHEMA='earthchain.signed-exchange-test.v1';
export const VIEW='earthchain.commerce-view-test.v1';
export function canonical(x){if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);if(typeof x==='number'&&Number.isSafeInteger(x))return JSON.stringify(x);if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(x&&Object.getPrototypeOf(x)===Object.prototype)return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';throw Error('non_json_value');}
const bytes=x=>new TextEncoder().encode(canonical(x));
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export const hash=async x=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes(x))),x=>x.toString(16).padStart(2,'0')).join('');
export function pem(base64){return '-----BEGIN PUBLIC KEY-----\n'+base64.match(/.{1,64}/g).join('\n')+'\n-----END PUBLIC KEY-----\n';}
function rawKey(publicKey){if(typeof publicKey!=='string'||publicKey.length>4096)throw Error('invalid_public_key');return unb64(publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g,''));}
export async function fingerprint(publicKey){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',rawKey(publicKey))),x=>x.toString(16).padStart(2,'0')).join('');}
export async function verifyView(envelope,{pin,now=Date.now(),guard=null}={}){
 const v=envelope?.view;
 if(!v||v.schema!==VIEW||typeof envelope.signature!=='string'||envelope.signature.length!==88)throw Error('invalid_view');
 if(!pin||envelope.publicKey!==pin.publicKey||v.config?.network!==pin.network)throw Error('coordinator_not_pinned');
 if(v.config.schema!==SCHEMA||v.config.asset!=='ECTEST'||!/^EARTHCHAIN_COMMERCE_TEST_[a-f0-9]{32}$/.test(v.config.network)||!Array.isArray(v.config.issuers)||!v.config.issuers.includes('ec_'+(await fingerprint(envelope.publicKey)).slice(0,32)))throw Error('invalid_coordinator');
 if(!Number.isSafeInteger(now)||!Number.isSafeInteger(v.issuedAt)||!Number.isSafeInteger(v.expiresAt)||v.issuedAt>now+30000||v.expiresAt<=now||v.expiresAt<=v.issuedAt||v.expiresAt-v.issuedAt>300000)throw Error('expired_view');
 if(!Number.isSafeInteger(v.count)||v.count<0||v.count>1000||!(v.head===null||/^[a-f0-9]{64}$/.test(v.head))||!v.balances||!v.collectibles||!Array.isArray(v.orders))throw Error('invalid_projection');
 const key=await crypto.subtle.importKey('spki',rawKey(envelope.publicKey),'Ed25519',false,['verify']);
 if(!await crypto.subtle.verify('Ed25519',key,unb64(envelope.signature),bytes(v)))throw Error('view_signature_rejected');
 if(guard&&(v.count<guard.count||(v.count===guard.count&&v.head!==guard.head)))throw Error('rollback_or_fork');
 return structuredClone(v);
}
export async function signPurchase(wallet,view,orderId,{now=Date.now(),requestId=crypto.randomUUID()}={}){
 const o=view.orders.find(o=>o.orderId===orderId),token=o&&view.collectibles[o.tokenId];
 if(!wallet?.privateKey||!o||o.status!=='open'||o.seller===wallet.address||token?.owner!==o.seller||now>=o.expiresAt||now>=view.expiresAt)throw Error('offer_unavailable');
 if(!Number.isSafeInteger(o.price)||o.price<1||(view.balances[wallet.address]??0)<o.price)throw Error('insufficient_test_balance');
 const publicKey=pem(wallet.publicKey);
 if('ec_'+(await fingerprint(publicKey)).slice(0,32)!==wallet.address)throw Error('wallet_key_mismatch');
 const message={schema:SCHEMA,network:view.config.network,asset:'ECTEST',requestId,actor:wallet.address,nonce:view.count,previousHash:view.head,expiresAt:Math.min(view.expiresAt,o.expiresAt,now+120000),action:{type:'BUY',orderId:o.orderId,seller:o.seller,tokenId:o.tokenId,metadataHash:token.metadataHash,price:o.price}};
 return {message,publicKey,signature:b64(await crypto.subtle.sign('Ed25519',wallet.privateKey,bytes(message)))};
}
export async function confirmPurchase(envelope,pending,options){
 const view=await verifyView(envelope,options),r=view.receipt;
 if(!pending||!r||canonical(r.packet)!==canonical(pending))throw Error('receipt_request_mismatch');
 const {hash:expected,...body}=r;
 if(await hash(body)!==expected||!Number.isSafeInteger(r.index)||r.index>=view.count||r.index!==pending.message.nonce||r.previousHash!==pending.message.previousHash)throw Error('invalid_receipt');
 const a=pending.message.action;
 if(a.type!=='BUY'||view.collectibles[a.tokenId]?.owner!==pending.message.actor||view.collectibles[a.tokenId]?.metadataHash!==a.metadataHash)throw Error('ownership_not_confirmed');
 return view;
}
export async function starfallSkins(view,address){
 const owned=[];
 for(const [tokenId,token] of Object.entries(view.collectibles)){
  const match=/^starfall-(solar-lion|fire-horse|earth-steward)-[a-f0-9]{8}$/.exec(tokenId);
  if(token.owner!==address)continue;
  // Champion collectibles use the same pinned, signed coordinator projection.
  // No locally asserted champion status is accepted.
  const champion=/^starfall-champion-([a-z0-9-]{1,32})-([0-9]{1,12})$/.exec(tokenId);
  if(champion){
   const metadata={schema:'earthchain.game-collectible.v1',gameId:'starfall',skinId:'starfall-celestial-crown',tokenId,testOnly:true,achievement:'world-record-legacy',season:champion[1],recordSequence:Number(champion[2])};
   if(await hash(metadata)===token.metadataHash)owned.push({skinId:'starfall-celestial-crown',tokenId});
   continue;
  }
  if(!match)continue;
  const skinId=match[1],metadata={schema:'earthchain.game-collectible.v1',gameId:'starfall',skinId,tokenId,testOnly:true};
  if(await hash(metadata)===token.metadataHash)owned.push({skinId,tokenId});
 }
 return owned;
}
