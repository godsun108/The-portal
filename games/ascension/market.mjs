import {unlockWallet} from '../../earthchain-test/wallet-crypto.mjs';
import {canonical,pem,hash,verifyView,signPurchase,confirmPurchase,ascensionCollectibles} from '../starfall/commerce/browser-commerce.mjs';
import {ASCENSION_COLLECTIBLES} from './collectibles.mjs';

const $=id=>document.getElementById(id),KEY='earthchain.starfall.hosted.v1';
let config,data={guard:null,pending:null,envelope:null},wallet=null,token=null,view=null,selected=null,busy=false;

const tell=s=>$('status').textContent=s;
function persist(next){localStorage.setItem(KEY,JSON.stringify(next));data=next;}
function run(fn){return async()=>{if(busy)return;busy=true;try{await fn()}catch(e){tell(e.message||'Armory unavailable');}finally{busy=false}};}
function vault(){const saved=JSON.parse(localStorage.getItem('earthchain.no-server.v1')||'null');if(!saved?.vault)throw Error('Create or restore your existing Portal EarthChain wallet first.');return saved.vault;}
try{$('address').textContent=vault().address}catch(e){$('address').textContent=e.message}

async function settings(){
 if(!config){
  const response=await fetch('../starfall/commerce/hosted-config.json',{cache:'no-store'});
  if(!response.ok)throw Error('EarthChain checkout configuration unavailable');
  config=await response.json();
  if(!config.endpoint?.startsWith('https://'))throw Error('Secure checkout endpoint required');
 }
 return config;
}
async function api(path,body){
 await settings();
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetch(config.endpoint+path,{method:body?'POST':'GET',
   headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},
   body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store'});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||'EarthChain checkout unavailable');
  return result;
 }finally{clearTimeout(timer)}
}
function lock(){
 wallet=null;token=null;selected=null;$('password').value='';$('reviewBox').hidden=true;
 $('refresh').disabled=true;$('recover').disabled=true;render();
}
async function accept(envelope,confirm=false){
 const options={pin:config.pin,guard:data.guard};
 view=confirm?await confirmPurchase(envelope,data.pending,options):await verifyView(envelope,options);
 persist({...data,pin:config.pin,envelope,guard:{count:view.count,head:view.head},...(confirm?{pending:null}:{})});
 render();
}
async function render(){
 $('owned').replaceChildren();$('offers').replaceChildren();
 if(!view){$('owned').textContent='Connect to verify current ownership.';$('offers').textContent='Connect to load signed offers.';return}
 $('balance').textContent=(view.balances[vault().address]||0)+' ECTEST · test network';
 const address=vault().address;
 const owned=await ascensionCollectibles(view,address);
 if(owned.length){
  for(const item of owned){const row=document.createElement('article');row.textContent=item.label+' · verified owner';$('owned').append(row)}
 }else $('owned').textContent='No ASCENSION collectibles currently verified in this wallet.';
 const eligible=ASCENSION_COLLECTIBLES.filter(x=>x.acquisition.type==='purchase');
 let count=0;
 for(const item of eligible){
  const offer=view.orders.find(o=>o.status==='open'&&o.tokenId===item.tokenId&&o.seller!==address);
  const tokenRecord=view.collectibles[item.tokenId];
  if(!offer||!tokenRecord||await hash(item.metadata)!==tokenRecord.metadataHash)continue;
  count++;
  const row=document.createElement('article'),body=document.createElement('div'),name=document.createElement('strong'),description=document.createElement('small'),button=document.createElement('button');
  row.className='item';body.append(name,description);name.textContent=item.name;
  description.textContent=item.rarity.toUpperCase()+' · edition cap '+item.acquisition.editionLimit+' · cosmetic only';
  button.textContent=offer.price+' ECTEST · Review';button.disabled=!wallet||!!data.pending||Date.now()>=view.expiresAt||Date.now()>=offer.expiresAt;
  button.onclick=()=>{selected=offer.orderId;$('reviewBox').hidden=false;$('review').textContent='Pay '+offer.price+' ECTEST to '+offer.seller+' for '+item.name+'. Network: '+view.config.network+'. Token: '+item.tokenId+'. Metadata hash: '+tokenRecord.metadataHash+'. Test units have no monetary value.'};
  row.append(body,button);$('offers').append(row);
 }
 if(!count)$('offers').textContent='No ASCENSION limited drops are listed by the issuer yet. The catalogue is ready; listings appear only after the trusted issuer registers and signs them.';
 $('recover').disabled=!token||!data.pending;
}
async function recover(){
 if(!data.pending)return;
 const requestId=data.pending.message.requestId;
 const result=await api('/view?requestId='+encodeURIComponent(requestId));
 const checked=await verifyView(result.envelope,{pin:config.pin,guard:data.guard});
 if(checked.receipt){await accept(result.envelope,true);tell('Purchase confirmed. Ownership refreshed.');return}
 if(checked.checkedRequest?.requestId!==requestId||checked.checkedRequest.status!=='not_found')throw Error('Purchase status uncertain; pending request retained.');
 if(checked.issuedAt>=data.pending.message.expiresAt){await accept(result.envelope);persist({...data,pending:null});await render();tell('Expired request was not settled. Review a fresh offer.');return}
 const settled=await api('/purchase',data.pending);await accept(settled.envelope,true);tell('Purchase confirmed. Ownership refreshed.');
}

$('connect').onclick=run(async()=>{
 await settings();wallet=await unlockWallet(vault(),$('password').value);$('password').value='';
 const challengeResult=await api('/challenge',{publicKey:pem(wallet.publicKey)}),challenge=challengeResult.challenge;
 if(challenge.schema!=='earthchain.checkout-login.v1'||challenge.network!==config.pin.network||
    challenge.audience!==location.origin||challenge.actor!==wallet.address||challenge.expiresAt<=Date.now())throw Error('Wallet login challenge mismatch.');
 const signature=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('Ed25519',wallet.privateKey,new TextEncoder().encode(canonical(challenge))))));
 const connected=await api('/connect',{challenge,signature});token=connected.token;
 await accept(connected.envelope);$('refresh').disabled=false;
 if(data.pending)await recover();
 tell('Connected. Signed ownership and ASCENSION offers checked.');
});
$('buy').onclick=run(async()=>{
 if(!wallet||!selected||data.pending)throw Error('Connect your wallet and review an offer first.');
 const reviewed=view.orders.find(o=>o.orderId===selected),metadataHash=view.collectibles[reviewed.tokenId]?.metadataHash;
 await accept((await api('/view')).envelope);
 const current=view.orders.find(o=>o.orderId===selected);
 if(!current||canonical(current)!==canonical(reviewed)||view.collectibles[current.tokenId]?.metadataHash!==metadataHash)throw Error('Offer changed. Review it again before signing.');
 const packet=await signPurchase(wallet,view,selected);
 persist({...data,pending:packet});selected=null;$('reviewBox').hidden=true;$('recover').disabled=false;
 tell('Submitting signed ECTEST purchase…');
 try{await accept((await api('/purchase',packet)).envelope,true);tell('Purchased. Signed ownership receipt verified.');}
 catch(error){tell((error.message||'Purchase uncertain')+' — request saved. Use Recover pending purchase; do not sign a second purchase.');}
});
$('refresh').onclick=run(async()=>{await accept((await api('/view')).envelope);tell('Ownership refreshed from the pinned signed view.')});
$('recover').onclick=run(recover);
$('lock').onclick=()=>{lock();tell('Wallet locked.');};
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock()});
if(data.pending)tell('A purchase is pending. Connect the same wallet to recover its exact status.');
