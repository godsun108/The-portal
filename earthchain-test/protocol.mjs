// Browser/Node Web Crypto verifier. Test-only; independent of coordinator state.
export const SCHEMA = 'earthchain.first-exchange.v1';
export const ASSET = 'ECTEST';
export const ALLOCATION = 100;
export const addressPattern = /^ec_[0-9a-f]{32}$/;
export const hex = bytes => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
export const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
export const unb64 = s => { if (typeof s !== 'string' || s.length > 8192) throw Error('invalid_base64'); return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const bytes = x => new TextEncoder().encode(JSON.stringify(x));
export const digest = async x => hex(await crypto.subtle.digest('SHA-256', bytes(x)));
function exact(x, keys) { if (!x || Array.isArray(x) || Object.keys(x).sort().join() !== [...keys].sort().join()) throw Error('invalid_fields'); }
export function validateConfig(c) {
  exact(c, ['schema','network','asset','fee','participants']);
  if (c.schema !== SCHEMA || !/^EARTHCHAIN_TEST_[a-f0-9]{32}$/.test(c.network) || c.asset !== ASSET || c.fee !== 0 || !Array.isArray(c.participants) || c.participants.length !== 2 || new Set(c.participants).size !== 2 || c.participants.some(a => !addressPattern.test(a))) throw Error('invalid_test_configuration');
  return c;
}
export async function addressOf(publicKey) {
  const raw = unb64(publicKey);
  await crypto.subtle.importKey('spki', raw, 'Ed25519', false, ['verify']);
  return 'ec_' + hex(await crypto.subtle.digest('SHA-256', raw)).slice(0,32);
}
export function messageBytes(m) {
  exact(m, ['schema','network','asset','fee','nonce','previousHash','action']);
  exact(m.action, ['type','actor','to','amount','at']);
  const a=m.action;
  if(m.schema!==SCHEMA || m.asset!==ASSET || m.fee!==0 || !Number.isSafeInteger(m.nonce) || m.nonce<0 || !(m.previousHash===null || /^[a-f0-9]{64}$/.test(m.previousHash)) || !addressPattern.test(a.actor) || !addressPattern.test(a.to) || !['FAUCET','TRANSFER'].includes(a.type) || !Number.isSafeInteger(a.amount) || a.amount<1 || a.amount>200 || !Number.isSafeInteger(a.at) || a.at<0) throw Error('invalid_intent');
  return bytes([m.schema,m.network,m.asset,m.fee,m.nonce,m.previousHash,a.type,a.actor,a.to,a.amount,a.at]);
}
export async function verifyPacket(config, packet, nonce, head) {
  validateConfig(config); exact(packet,['message','publicKey','signature']);
  const m=packet.message, a=m.action;
  if(m.network!==config.network || m.nonce!==nonce || m.previousHash!==head || !config.participants.includes(a.actor) || !config.participants.includes(a.to)) throw Error('network_participant_or_replay_rejected');
  if(await addressOf(packet.publicKey)!==a.actor) throw Error('actor_key_mismatch');
  const key=await crypto.subtle.importKey('spki',unb64(packet.publicKey),'Ed25519',false,['verify']);
  if(!await crypto.subtle.verify('Ed25519',key,unb64(packet.signature),messageBytes(m))) throw Error('signature_rejected');
  if(a.type==='FAUCET' && (a.actor!==a.to || a.amount!==ALLOCATION)) throw Error('faucet_policy_rejected');
  return a;
}
export async function packetId(packet) { return digest([b64(messageBytes(packet.message)),packet.publicKey,packet.signature]); }
export async function verifyJournal(journal, trustedConfig, previous=null) {
  validateConfig(trustedConfig); exact(journal,['schema','config','entries']);
  if(journal.schema!==SCHEMA || JSON.stringify(journal.config)!==JSON.stringify(trustedConfig) || !Array.isArray(journal.entries) || journal.entries.length>1000) throw Error('journal_configuration_rejected');
  const balances=Object.fromEntries(trustedConfig.participants.map(a=>[a,0])), used=new Set(); let head=null;
  for(let i=0;i<journal.entries.length;i++) {
    const e=journal.entries[i]; exact(e,['packet','id']);
    const a=await verifyPacket(trustedConfig,e.packet,i,head);
    if(a.type==='FAUCET') { if(used.has(a.actor)) throw Error('faucet_already_used'); used.add(a.actor); balances[a.actor]+=ALLOCATION; }
    else { if(a.actor===a.to || balances[a.actor]<a.amount) throw Error('invalid_transfer'); balances[a.actor]-=a.amount; balances[a.to]+=a.amount; }
    if(e.id!==await packetId(e.packet)) throw Error('receipt_hash_mismatch'); head=e.id;
  }
  if(previous && (journal.entries.length<previous.count || (previous.count>0 && journal.entries[previous.count-1]?.id!==previous.head))) throw Error('rollback_or_fork_detected');
  return {network:trustedConfig.network,asset:ASSET,fee:0,count:journal.entries.length,head,balances,faucetUsed:[...used],finality:'single_coordinator_commit_not_distributed_consensus'};
}
