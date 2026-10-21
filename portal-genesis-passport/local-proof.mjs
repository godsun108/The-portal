import {addressOf,b64,unb64} from '../earthchain-test/protocol.mjs';
const encoder=new TextEncoder();
export async function signProof(wallet){
 const nonce=Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
 const message={schema:'portal.genesis.local-proof.v1',domain:'godsun108.github.io/The-portal',address:wallet.address,nonce};
 const signature=b64(await crypto.subtle.sign('Ed25519',wallet.privateKey,encoder.encode(JSON.stringify(message))));
 return {message,publicKey:wallet.publicKey,signature};
}
export async function verifyProof(p){
 try{
  if(!p||Object.keys(p).sort().join()!=='message,publicKey,signature')return false;
  const m=p.message;
  if(!m||Object.keys(m).sort().join()!=='address,domain,nonce,schema')return false;
  if(m.schema!=='portal.genesis.local-proof.v1'||m.domain!=='godsun108.github.io/The-portal')return false;
  if(!/^ec_[a-f0-9]{32}$/.test(m.address)||!/^[a-f0-9]{64}$/.test(m.nonce))return false;
  if(await addressOf(p.publicKey)!==m.address)return false;
  const key=await crypto.subtle.importKey('spki',unb64(p.publicKey),'Ed25519',false,['verify']);
  return await crypto.subtle.verify('Ed25519',key,unb64(p.signature),encoder.encode(JSON.stringify(m)));
 }catch{return false}
}
