import test from 'node:test';import assert from 'node:assert/strict';import {validateCryptoEnvelope} from './earthchain-crypto-policy-lab.mjs';
const envelope={chainId:'ec-lab',purpose:'validator-vote',protocolVersion:1,algorithm:'hybrid-ed25519-ml-dsa-65',signatures:[{keyId:'classical',signature:'placeholder'},{keyId:'pq',signature:'placeholder'}]};
const policy={chainId:'ec-lab',purpose:'validator-vote'};
test('hybrid envelope passes metadata policy but never authenticates',()=>{const result=validateCryptoEnvelope(envelope,policy);assert.equal(result.policyAccepted,true);assert.equal(result.cryptographicallyVerified,false);assert.equal(result.productionAuthorized,false)});
test('classical-only downgrade rejected',()=>{assert.throws(()=>validateCryptoEnvelope({...envelope,algorithm:'ed25519-lab',signatures:[envelope.signatures[0]]},policy),/Hybrid signature required/)});
test('unknown algorithm rejected',()=>{assert.throws(()=>validateCryptoEnvelope({...envelope,algorithm:'made-up'},policy),/Unknown signing algorithm/)});
test('cross-chain and cross-purpose replay rejected',()=>{assert.throws(()=>validateCryptoEnvelope({...envelope,chainId:'other'},policy),/Domain separation/);assert.throws(()=>validateCryptoEnvelope({...envelope,purpose:'transaction'},policy),/Domain separation/)});
test('missing PQ signature slot rejected',()=>{assert.throws(()=>validateCryptoEnvelope({...envelope,signatures:[envelope.signatures[0]]},policy),/Invalid signature slots/)});
