import {unlockWallet} from '../../../earthchain-test/wallet-crypto.mjs';
import {verifyView,confirmPurchase,signPurchase,fingerprint,starfallSkins} from './browser-commerce.mjs';
const $=id=>document.getElementById(id),KEY='earthchain.starfall.commerce.v1';
let data={pin:null,guard:null,pending:null,envelope:null},wallet=null,view=null,inspected=null,selected=null,busy=false;
try{data=JSON.parse(localStorage.getItem(KEY))||data;}catch{$('status').textContent='Stored session is unreadable. No purchase will be signed.';}
function persist(next){localStorage.setItem(KEY,JSON.stringify(next));data=next;}
function message(s){$('status').textContent=s;}
function lock(){wallet=null;selected=null;$('password').value='';$('sign').disabled=true;message('Wallet locked.');}
function download(packet){const url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='earthchain-purchase.public.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function run(fn){return async()=>{if(busy)return;busy=true;try{await fn();}catch(e){selected=null;$('sign').disabled=true;message(e.message);}finally{busy=false;}};}
function savedWallet(){const s=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null');if(!s?.vault)throw Error('Create or restore your existing test wallet first.');return s.vault;}
try{$('address').textContent=savedWallet().address;}catch(e){$('address').textContent=e.message;}
$('unlock').onclick=run(async()=>{const password=$('password').value;$('password').value='';wallet=await unlockWallet(savedWallet(),password);message('Unlocked locally. Private key stays in this tab.');if(view)render();});$('lock').onclick=lock;
async function accept(envelope,pin){
 const guard=data.pin?data.guard:null;let nextView;
 if(data.pending){
  const checked=await verifyView(envelope,{pin,guard});
  if(checked.checkedRequest?.requestId===data.pending.message.requestId&&checked.checkedRequest.status==='not_found'&&checked.issuedAt>=data.pending.message.expiresAt){nextView=checked;}
  else nextView=await confirmPurchase(envelope,data.pending,{pin,guard});
 }else nextView=await verifyView(envelope,{pin,guard});
 persist({...data,pin,guard:{count:nextView.count,head:nextView.head},pending:null,envelope});view=nextView;selected=null;$('sign').disabled=true;$('download').disabled=true;render();
 const skins=await starfallSkins(view,savedWallet().address);message(skins.length?'Ownership attested. Return to Starfall to use the test hull while this view is fresh.':'Offers verified. Unlock your wallet and select a purchase.');
}
function render(){
 $('network').textContent=view.config.network+' · '+(wallet?(view.balances[wallet.address]||0)+' ECTEST':'Unlock to see balance');$('offers').replaceChildren();$('review').textContent='';
 for(const offer of view.orders.filter(o=>o.status==='open')){const button=document.createElement('button');button.textContent=offer.tokenId+' · '+offer.price+' ECTEST';button.disabled=!wallet||!!data.pending||Date.now()>=view.expiresAt||Date.now()>=offer.expiresAt;button.onclick=()=>{selected=offer.orderId;$('review').textContent='Pay '+offer.price+' ECTEST to '+offer.seller+' for '+offer.tokenId+'. Metadata: '+view.collectibles[offer.tokenId]?.metadataHash+'. Test units have no monetary value.';$('sign').disabled=false;};$('offers').append(button);}
}
$('import').onclick=run(async()=>{const file=$('file').files[0];if(!file||file.size>1000000)throw Error('Choose a public offer or receipt file below 1 MB.');const envelope=JSON.parse(await file.text());if(!envelope?.view)throw Error('Expected a public commerce view, not a wallet backup.');if(data.pin){await accept(envelope,data.pin);return;}
 const pin={network:envelope.view.config?.network,publicKey:envelope.publicKey};await verifyView(envelope,{pin});inspected=envelope;$('coordinator').textContent='Network: '+pin.network+' · Coordinator fingerprint: '+await fingerprint(pin.publicKey);$('pin').disabled=false;message('Verify this fingerprint with the operator before trusting.');});
$('pin').onclick=run(async()=>{if(!inspected||!$('trust').checked)throw Error('Verify the coordinator and check the trust box first.');await accept(inspected,{network:inspected.view.config.network,publicKey:inspected.publicKey});inspected=null;$('pin').disabled=true;});
$('sign').onclick=run(async()=>{if(!wallet||!selected||data.pending)throw Error('Unlock, select an offer, and resolve any pending request first.');view=await verifyView(data.envelope,{pin:data.pin,guard:data.guard});const packet=await signPurchase(wallet,view,selected);persist({...data,pending:packet});selected=null;$('sign').disabled=true;$('download').disabled=false;download(packet);render();message('Pending: public request saved before export. Send it to the operator and import the signed receipt.');});
$('download').onclick=run(async()=>{if(!data.pending)throw Error('No pending request');download(data.pending);});
if(data.pending){$('download').disabled=false;message('A purchase is pending. Re-export the same request or import its receipt.');}
else if(data.envelope){verifyView(data.envelope,{pin:data.pin,guard:data.guard}).then(v=>{view=v;render();}).catch(e=>message(e.message+' — import a fresh operator view.'));}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock();});
