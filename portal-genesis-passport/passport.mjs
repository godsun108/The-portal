import {unlockWallet} from '../earthchain-test/wallet-crypto.mjs';
import {signProof,verifyProof} from './local-proof.mjs';
const $=id=>document.getElementById(id);function refresh(){let vault;try{vault=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null')?.vault}catch{}const address=vault?.schema==='earthchain.encrypted-test-wallet.v1'&&typeof vault.address==='string'&&vault.address.length>12?vault.address:null;if(address){$('wallet-address').textContent=address.slice(0,12)+'…'+address.slice(-8);$('serial').textContent='PREVIEW · '+address.slice(-8).toUpperCase();$('status').textContent='Existing test wallet detected in this browser. Your visual passport preview is ready; no NFT or claim has been issued.'}else{$('wallet-address').textContent='NO TEST WALLET DETECTED';$('serial').textContent='PREVIEW / UNASSIGNED';$('status').textContent='Create or restore a test wallet in this browser to personalize your preview.'}}$('refresh').addEventListener('click',refresh);window.addEventListener('pageshow',refresh);refresh();
const PROOF_KEY='portal.genesis.local-proof.v1';
function readVault(){try{const v=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null')?.vault;return v?.schema==='earthchain.encrypted-test-wallet.v1'?v:null}catch{return null}}
async function checkProof(){
 const vault=readVault();let proof=null;
 try{proof=JSON.parse(localStorage.getItem(PROOF_KEY)||'null')}catch{}
 const valid=Boolean(vault&&proof?.message?.address===vault.address&&await verifyProof(proof));
 $('sign-proof').disabled=!vault;
 $('proof-status').textContent=valid?'Signature verified locally for this test wallet. No NFT minted or global claim issued.':'No valid local proof for this wallet yet.';
}
$('sign-proof').addEventListener('click',async()=>{
 const button=$('sign-proof');button.disabled=true;
 try{
  const vault=readVault();if(!vault)throw Error('No test wallet found');
  const wallet=await unlockWallet(vault,$('proof-password').value);
  const proof=await signProof(wallet);
  if(!await verifyProof(proof))throw Error('Signature verification failed');
  localStorage.setItem(PROOF_KEY,JSON.stringify(proof));
  $('proof-password').value='';
  await checkProof();
 }catch(error){$('proof-status').textContent='Proof not saved: '+(error?.message||'Unknown error')}
 finally{button.disabled=!readVault()}
});
$('refresh').addEventListener('click',()=>{checkProof().catch(()=>{})});
window.addEventListener('pageshow',()=>{checkProof().catch(()=>{})});
checkProof().catch(()=>{});
