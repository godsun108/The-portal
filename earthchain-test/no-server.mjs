import {SCHEMA,ASSET,addressPattern,validateConfig} from './protocol.mjs';
import {createWallet,unlockWallet,signAction} from './wallet-crypto.mjs';
import {emptyMutual,verifyMutual,inspectProposal,acknowledge,reserve,actionCommitment} from './mutual-ledger.mjs';
const $=id=>document.getElementById(id),KEY='earthchain.no-server.v1';
let saved=JSON.parse(localStorage.getItem(KEY)||'{"vault":null,"bundle":null,"guards":{},"pending":null}');
let wallet=null,review=null,busy=false;
let verifiedState=null;
const tell=m=>{$('status').textContent=m;};
function persist(next){localStorage.setItem(KEY,JSON.stringify(next));saved=next;}
function lock(){wallet=null;review=null;$('password').value='';$('wallet-state').textContent='Locked';$('accept').disabled=true;guide();}
function ready(){if(!wallet)throw Error('Unlock your wallet first.');if(!$('backed').checked)throw Error('Save your private wallet backup first.');}
function download(name,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function copyText(value){
 try{await navigator.clipboard.writeText(value);return true;}catch{
  const area=document.createElement('textarea');area.value=value;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();return ok;
 }
}
function outbound(){if(!saved.bundle)throw Error('Create or accept a session first.');return {schema:'earthchain.public-message.v1',bundle:saved.bundle,proposal:saved.pending};}
async function render(){
 $('address').textContent=saved.vault?.address||'No wallet';$('config').textContent=saved.bundle?JSON.stringify(saved.bundle.journal.config,null,2):'No session pinned';
 $('pending').textContent=saved.pending?'Signed proposal pending peer approval. Re-share the same proposal; do not create another.':'No outgoing proposal pending';
 if(!saved.bundle){verifiedState=null;guide();return;}
 const c=saved.bundle.journal.config,s=await verifyMutual(saved.bundle,c);verifiedState=s;guide();
 $('balance').textContent=`${s.balances[saved.vault.address]} ECTEST · fee 0 · ${s.count} co-signed entries\nHead: ${s.head||'empty'}`;
 $('history').textContent=saved.bundle.journal.entries.map((e,i)=>`${i} · ${e.packet.message.action.type} · ${e.packet.message.action.amount} ECTEST\n${e.packet.message.action.actor} → ${e.packet.message.action.to}\n${e.id}\nBoth signatures verified`).join('\n\n')||'Empty verified journal';
}
function run(fn){return async()=>{if(busy)return;busy=true;try{await fn();}catch(e){review=null;$('accept').disabled=true;tell(e.message||'Operation failed');}finally{busy=false;guide();}};}
$('create').onclick=run(async()=>{if(saved.vault)throw Error('A wallet already exists here. Keep its backup.');const v=await createWallet($('password').value),w=await unlockWallet(v,$('password').value);persist({...saved,vault:v});wallet=w;$('password').value='';$('wallet-state').textContent='Unlocked';await render();tell('Created privately on your device. Download the encrypted backup and save your password separately.');});
$('unlock').onclick=run(async()=>{if(!saved.vault)throw Error('Create or restore a test wallet.');wallet=await unlockWallet(saved.vault,$('password').value);$('password').value='';$('wallet-state').textContent='Unlocked';tell('Unlocked locally.');});
$('lock').onclick=lock;
$('backup').onclick=run(async()=>{if(!saved.vault)throw Error('No wallet');download('earthchain-private-encrypted-test-wallet.json',saved.vault);});
$('copy-address').onclick=run(async()=>{if(!saved.vault)throw Error('Create or restore a wallet first.');if(!await copyText(saved.vault.address))throw Error('Clipboard unavailable; copy the address from the page.');tell('Public address copied. It is safe to share; never share your backup or password.');});
$('restore-button').onclick=run(async()=>{const f=$('restore').files[0];if(!f||f.size>8192)throw Error('Select your encrypted wallet backup.');const v=JSON.parse(await f.text());if(saved.vault&&saved.vault.address!==v.address)throw Error('Different wallet: use a separate browser profile.');const w=await unlockWallet(v,$('password').value);persist({...saved,vault:v});wallet=w;$('password').value='';$('wallet-state').textContent='Unlocked · recovery verified';await render();tell('Recovered wallet. If this is a replacement device, import the latest co-signed ledger and reconcile any pending proposal with your friend before signing.');});
$('session').onclick=run(async()=>{ready();if(saved.bundle)throw Error('A session is already pinned.');const peer=$('friend').value.trim();if(!addressPattern.test(peer)||peer===wallet.address)throw Error('Enter your friend’s distinct public address.');const random=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');const c={schema:SCHEMA,network:'EARTHCHAIN_TEST_'+random,asset:ASSET,fee:0,participants:[wallet.address,peer]};validateConfig(c);persist({...saved,bundle:emptyMutual(c)});await render();tell('Session created. Share the public message and compare its network and both addresses with your friend.');});
async function propose(type,amount){
 ready();if(!saved.bundle)throw Error('Agree on a session first.');if(saved.pending)throw Error('Re-share your existing pending proposal.');
 const c=saved.bundle.journal.config,state=await verifyMutual(saved.bundle,c),to=type==='FAUCET'?wallet.address:c.participants.find(a=>a!==wallet.address);
 const action=saved.draft||{type,actor:wallet.address,to,amount,at:Date.now()};
 if(saved.draft){type=action.type;amount=action.amount;}
 if(action.actor!==wallet.address || !c.participants.includes(action.to))throw Error('Invalid saved signing draft.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>200)throw Error('Use whole test points.');
 if(!confirm(`${type}: ${amount} ECTEST\nTo: ${action.to}\nNetwork: ${c.network}\nFee: 0. No monetary value. Sign this proposal?`))return;
 if(type==='FAUCET'&&(state.faucetUsed.includes(wallet.address)||amount!==100||action.to!==wallet.address))throw Error('Test allocation already used or invalid.');
 if(type==='TRANSFER'&&(amount>state.balances[wallet.address]||action.to===wallet.address))throw Error('Insufficient points or invalid recipient.');
 const commitment=await actionCommitment(c,state.count,state.head,action),guards=reserve(saved.guards,state.count,commitment);
 // Reserve before signing; retain the exact draft so interruption can be resumed.
 persist({...saved,guards,draft:action});
 const packet=await signAction(wallet,c,state,action);await inspectProposal(saved.bundle,packet,c);
 persist({...saved,guards,pending:packet,draft:null});await render();tell('Proposal saved; not confirmed. Share its public message for your friend to review and sign.');
}
$('faucet').onclick=run(()=>propose('FAUCET',100));$('propose').onclick=run(()=>propose('TRANSFER',Number($('amount').value)));
$('download').onclick=run(async()=>download('earthchain-public-message.json',outbound()));
$('copy').onclick=run(async()=>{if(!await copyText(JSON.stringify(outbound())))throw Error('Clipboard unavailable; use Download instead.');tell('Public message copied.');});
$('share').onclick=run(async()=>{const text=JSON.stringify(outbound());if(navigator.share && text.length<12000){await navigator.share({text});tell('Message shared. Ask your friend to check it and send the reply.');}else{download('earthchain-public-message.json',outbound());tell('Public message file saved. Send that file to your friend.');}});
$('share-address').onclick=run(async()=>{if(!saved.vault)throw Error('Create a wallet first.');if(navigator.share)await navigator.share({text:saved.vault.address});else if(!await copyText(saved.vault.address))throw Error('Copy your public address from the page.');});
$('public-file').onchange=run(async()=>{const f=$('public-file').files[0];if(!f||f.size>2000000)throw Error('Public file too large or missing.');$('incoming').value=await f.text();await inspectIncoming();});
$('incoming').oninput=()=>{review=null;$('accept').disabled=true;};
async function inspectIncoming(){
 ready();if($('incoming').value.length>2000000)throw Error('Message too large.');
 const incoming=JSON.parse($('incoming').value);if(incoming?.schema!=='earthchain.public-message.v1')throw Error('Only public session/proposal/receipt messages accepted here.');
 const c=incoming.bundle?.journal?.config;validateConfig(c);if(!c.participants.includes(wallet.address))throw Error('Your address is not in this session.');
 const current=saved.bundle?await verifyMutual(saved.bundle,saved.bundle.journal.config):null;
 if(saved.bundle&&JSON.stringify(c)!==JSON.stringify(saved.bundle.journal.config))throw Error('Network differs from pinned session.');
 const state=await verifyMutual(incoming.bundle,c,current);
 if(saved.pending&&state.count>current.count){const accepted=incoming.bundle.journal.entries[current.count];if(JSON.stringify(accepted.packet)!==JSON.stringify(saved.pending))throw Error('Incoming history conflicts with your pending proposal.');}
 if(saved.pending&&incoming.proposal&&state.count===current.count)throw Error('Your proposal is pending; ask your friend to sign it first.');
 let proposed=null;if(incoming.proposal){proposed=await inspectProposal(incoming.bundle,incoming.proposal,c);if(proposed.action.actor===wallet.address)throw Error('This is your own proposal; your friend must sign it.');}
 review={incoming,state,proposed};$('review').textContent=`Network: ${c.network}\nParticipants: ${c.participants.join(' / ')}\nVerified co-signed entries: ${state.count}\n${proposed?'REQUEST TO COUNTERSIGN: '+proposed.action.type+' '+proposed.action.amount+' ECTEST\nFrom: '+proposed.action.actor+'\nTo: '+proposed.action.to:'Session / receipt import only; no transfer signature needed.'}\nFee: 0. Compare with your friend before accepting.`;$('accept').textContent=proposed?'Approve and sign this request':saved.bundle?'Save verified reply':'Accept this shared test';$('accept').disabled=false;
}
$('inspect').onclick=run(inspectIncoming);
$('accept').onclick=run(async()=>{
 ready();if(!review)throw Error('Inspect first.');const {incoming,state,proposed}=review,c=incoming.bundle.journal.config;
 if(!confirm('Accept the reviewed network, addresses and action exactly as shown?'))return;
 let bundle=incoming.bundle,guards=saved.guards;
 if(proposed){const action=incoming.proposal.message.action,commitment=await actionCommitment(c,state.count,state.head,action);guards=reserve(guards,state.count,commitment);persist({...saved,guards});bundle=await acknowledge(bundle,incoming.proposal,wallet,c);}
 const oldCount=saved.bundle?.journal.entries.length??0;
 const pending=saved.pending&&state.count<=oldCount?saved.pending:null;
 if(saved.draft&&state.count>oldCount){const entry=bundle.journal.entries[oldCount];if(JSON.stringify(entry.packet.message.action)!==JSON.stringify(saved.draft))throw Error('Incoming history conflicts with your reserved signing draft.');}
 persist({...saved,bundle,guards,pending,draft:state.count>oldCount?null:saved.draft});review=null;$('accept').disabled=true;await render();tell(proposed?'Both signatures verified and saved here. Return the public receipt; your friend must import it to finish.':'Verified session/receipt saved. Compare the ledger head and balances with your friend.');
});
$('verify').onclick=run(async()=>{await render();tell('Saved co-signed history verified locally. Compare checkpoint with your friend.');});
$('export').onclick=run(async()=>{if(!saved.bundle)throw Error('No session');await render();download('earthchain-cosigned-public-ledger.json',{schema:'earthchain.public-message.v1',bundle:saved.bundle,proposal:saved.pending});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock();});let idle;const touch=()=>{clearTimeout(idle);idle=setTimeout(lock,300000);};document.addEventListener('pointerdown',touch);document.addEventListener('keydown',touch);touch();
if(!crypto.subtle||!isSecureContext)tell('Open on an approved HTTPS static host or localhost. This device must support Ed25519 Web Crypto.');else render().then(()=>tell('No-server test mode ready. No network requests are made by this application.')).catch(e=>tell(e.message));
if('serviceWorker' in navigator && isSecureContext)navigator.serviceWorker.register('./sw.js').catch(()=>{});


// Guidance only: every balance and signature remains verified by the existing protocol.
function guide(){
 const has=!!saved.vault, unlocked=!!wallet, backed=$('backed').checked, session=!!saved.bundle;
 $('create').hidden=has;$('unlock').hidden=!has||unlocked;$('lock').hidden=!unlocked;
 $('password').hidden=unlocked;document.querySelector('label[for="password"]').hidden=unlocked;
 $('backup').hidden=!has;$('share-address').hidden=!has;$('copy-address').hidden=!has;
 $('connect-panel').hidden=!has||!backed;
 $('send-panel').hidden=!session;$('receive-panel').hidden=!has||!backed;$('history-panel').hidden=!session;
 $('session').disabled=session||!unlocked;$('friend').disabled=session;
 for(const id of ['share','copy','download'])$(id).disabled=!session;
 $('faucet').hidden=!!verifiedState?.faucetUsed.includes(saved.vault?.address);
 $('faucet').disabled=!unlocked||!!saved.pending;
 $('propose').disabled=!unlocked||!!saved.pending||!(verifiedState?.balances[saved.vault?.address]>0);
 let title,help,target;
 if(!has){title='Create your test wallet';help='Choose a private password. Your friend creates their own wallet on their phone.';target='wallet-panel';}
 else if(!unlocked){title='Unlock on this phone';help='Enter your wallet password here. It stays on this device. Switching apps locks the wallet.';target='wallet-panel';}
 else if(!backed){title='Save your private backup';help='Tap Save my private backup, keep your password separately, then check the box. Never send the backup to your friend.';target='wallet-panel';}
 else if(!session){title='Connect with your friend';help='Send my address shares only your public address. One person enters the other address and starts the test; the other opens their message below.';target='connect-panel';}
 else if(saved.pending){title='Waiting for your friend';help='Send the message below. Your friend checks and signs it, then sends a reply for you to open here. Your balance has not changed yet.';target='receive-panel';}
 else if(verifiedState?.count===0){title='Get your first test points';help='Only one person requests 100 test points. Send that request to the other person for approval, then open their reply.';target='send-panel';}
 else{title='Send points or open a reply';help='Choose an amount and review the send. If you just approved a request, send your message back so your friend can verify it too.';target='send-panel';}
 $('next-title').textContent=title;$('next-help').textContent=help;
 $('next-action').textContent='Go to this step';$('next-action').onclick=()=>$(target).scrollIntoView({behavior:'smooth',block:'start'});
}
$('backed').checked=saved.backupConfirmed===true;
$('backed').onchange=run(async()=>{persist({...saved,backupConfirmed:$('backed').checked});});
guide();
