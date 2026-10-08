// TEST WALLET ONLY. Secret bytes stay in the caller's device; no network APIs.
import {SCHEMA,ASSET,b64,unb64,addressOf,messageBytes} from './protocol.mjs';
const ITERATIONS=600000;
const enc=new TextEncoder();
async function wrapKey(password,salt) {
  if(typeof password!=='string'||password.length<16||password.length>1024) throw Error('use_a_unique_password_of_at_least_16_characters');
  const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function createWallet(password) {
  const pair=await crypto.subtle.generateKey('Ed25519',true,['sign','verify']);
  const publicKey=b64(await crypto.subtle.exportKey('spki',pair.publicKey));
  const address=await addressOf(publicKey), salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
  const secret=new Uint8Array(await crypto.subtle.exportKey('pkcs8',pair.privateKey));
  try {
    const key=await wrapKey(password,salt);
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(address)},key,secret);
    return {schema:'earthchain.encrypted-test-wallet.v1',address,publicKey,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)};
  } finally { secret.fill(0); }
}
export async function unlockWallet(vault,password) {
  if(vault?.schema!=='earthchain.encrypted-test-wallet.v1'||vault.kdf!=='PBKDF2-SHA256'||vault.iterations!==ITERATIONS||await addressOf(vault.publicKey)!==vault.address||unb64(vault.salt).length!==16||unb64(vault.iv).length!==12) throw Error('invalid_backup');
  const key=await wrapKey(password,unb64(vault.salt));
  const bytes=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(vault.iv),additionalData:enc.encode(vault.address)},key,unb64(vault.ciphertext)));
  try {
    const privateKey=await crypto.subtle.importKey('pkcs8',bytes,'Ed25519',false,['sign']);
    const challenge=crypto.getRandomValues(new Uint8Array(32));
    const publicKey=await crypto.subtle.importKey('spki',unb64(vault.publicKey),'Ed25519',false,['verify']);
    const signature=await crypto.subtle.sign('Ed25519',privateKey,challenge);
    if(!await crypto.subtle.verify('Ed25519',publicKey,signature,challenge)) throw Error('backup_key_mismatch');
    return {address:vault.address,publicKey:vault.publicKey,privateKey};
  } finally { bytes.fill(0); }
}
export async function signAction(wallet,config,state,action) {
  if(action.actor!==wallet.address || state.network!==config.network) throw Error('wallet_network_mismatch');
  const message={schema:SCHEMA,network:config.network,asset:ASSET,fee:0,nonce:state.count,previousHash:state.head,action};
  return {message,publicKey:wallet.publicKey,signature:b64(await crypto.subtle.sign('Ed25519',wallet.privateKey,messageBytes(message)))};
}
