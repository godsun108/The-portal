// Browser-compatible pairing invitation envelope. Discovery only, not authentication.
// The invite's public-key fingerprint must be verified over a trusted channel.
const enc=new TextEncoder();
export async function pairingFingerprint(publicKey){if(typeof publicKey!=="string"||publicKey.length<32||publicKey.length>8192)throw Error("invalid_public_key");const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(publicKey)));return [...bytes].map(x=>x.toString(16).padStart(2,"0")).join("");}
export async function createPairingCode({publicKey,now=Date.now(),ttlMs=120000,nonce}={}){
 if(!Number.isSafeInteger(now)||now<0||!Number.isSafeInteger(ttlMs)||ttlMs<1000||ttlMs>300000)throw Error("invalid_pairing_lifetime");
 if(typeof nonce!=="string"||!/^[a-f0-9]{32,64}$/.test(nonce))throw Error("invalid_pairing_nonce");
 return JSON.stringify({schema:"earthchain.bridge.pairing.v0",fingerprint:await pairingFingerprint(publicKey),nonce,issuedAt:now,expiresAt:now+ttlMs});
}
export function inspectPairingCode(code,{now=Date.now()}={}){
 if(typeof code!=="string"||code.length>1024)throw Error("invalid_pairing_code");
 let p;try{p=JSON.parse(code);}catch{throw Error("invalid_pairing_code");}
 if(p?.schema!=="earthchain.bridge.pairing.v0"||typeof p.fingerprint!=="string"||!/^[a-f0-9]{64}$/.test(p.fingerprint)||typeof p.nonce!=="string"||!/^[a-f0-9]{32,64}$/.test(p.nonce)||!Number.isSafeInteger(p.issuedAt)||!Number.isSafeInteger(p.expiresAt)||p.expiresAt-p.issuedAt<1000||p.expiresAt-p.issuedAt>300000||!Number.isSafeInteger(now)||now<p.issuedAt||now>=p.expiresAt)throw Error("invalid_or_expired_pairing_code");
 return Object.freeze({fingerprint:p.fingerprint,nonce:p.nonce,expiresAt:p.expiresAt,requiresOutOfBandVerification:true,connectsAutomatically:false});
}
