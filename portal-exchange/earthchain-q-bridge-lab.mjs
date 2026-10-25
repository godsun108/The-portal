/** EarthChain Q-Bridge v0.1: offline authenticated peer envelopes.
 * Classical Ed25519 research transport ONLY. Not ML-DSA, ML-KEM, encryption,
 * live networking, or a production quantum-secure transport.
 */
import {createHash,createPublicKey,sign,verify} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
const stable=({version,network,from,to,sequence,payloadDigest})=>JSON.stringify({version,network,from,to,sequence,payloadDigest});
export function peerId(publicKey){const pem=createPublicKey(publicKey).export({type:'spki',format:'pem'});return hash(pem);}
export function createPeerEnvelope({network,fromPrivateKey,fromPublicKey,to,sequence,payload}){
 if(typeof network!=='string'||!network.trim()||typeof to!=='string'||!to||!Number.isSafeInteger(sequence)||sequence<1)throw Error('Invalid peer envelope fields');
 if(typeof payload!=='string'||payload.length>65536)throw Error('Payload must be a bounded string');
 const from=peerId(fromPublicKey),publicKey=createPublicKey(fromPublicKey).export({type:'spki',format:'pem'});
 const envelope={version:1,network,from,to,sequence,payloadDigest:hash(payload)};
 return {...envelope,payload,publicKey,algorithm:'ed25519-lab',signature:sign(null,Buffer.from(stable(envelope)),fromPrivateKey).toString('hex')};
}
export function createPeerReceiver({network,privateKey,publicKey,allowedPeers}){
 const self=peerId(publicKey),last=new Map(),peers=new Set(allowedPeers);
 return {id:self,receive(envelope){
  if(!envelope||envelope.version!==1||envelope.network!==network||envelope.to!==self||envelope.algorithm!=='ed25519-lab')throw Error('Wrong network, destination or protocol');
  if(!Number.isSafeInteger(envelope.sequence)||envelope.sequence<1||typeof envelope.payload!=='string'||envelope.payload.length>65536)throw Error('Invalid sequence or payload');
  if(!peers.has(envelope.from)||peerId(envelope.publicKey)!==envelope.from)throw Error('Untrusted peer');
  if(hash(envelope.payload)!==envelope.payloadDigest)throw Error('Payload digest mismatch');
  if(typeof envelope.signature!=='string'||!/^[a-f0-9]{128}$/i.test(envelope.signature))throw Error('Invalid signature');
  if(!verify(null,Buffer.from(stable(envelope)),envelope.publicKey,Buffer.from(envelope.signature,'hex')))throw Error('Peer signature failed');
  if(envelope.sequence<=(last.get(envelope.from)||0))throw Error('Replay or out-of-order message');
  last.set(envelope.from,envelope.sequence);
  return {from:envelope.from,payload:envelope.payload,sequence:envelope.sequence};
 }};
}
