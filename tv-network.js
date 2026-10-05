// PORTAL TV Virtual Network: deterministic continuous rails from admitted programming.
// These are playlist channels, not fabricated live broadcasts.
(async function(){
 const root=document.getElementById('portalNetwork');if(!root)return;
 const status=root.querySelector('#networkStatus'),rail=root.querySelector('#networkChannels'),queue=root.querySelector('#networkQueue');
 let open=[];try{const r=await fetch('tv-open-library.json?v=1',{cache:'no-store'});if(r.ok)open=(await r.json()).programs||[]}catch{}
 const tagged=(x,t)=>Array.isArray(x.channelTags)&&x.channelTags.includes(t);
 const channels=[
  {id:'open-cinema',name:'PORTAL Open Cinema',icon:'🎬',match:x=>tagged(x,'cinema')||x.genre==='Movies'},
  {id:'animation',name:'Open Animation',icon:'✨',match:x=>tagged(x,'animation')},
  {id:'sci-fi',name:'Open Sci-Fi',icon:'🚀',match:x=>tagged(x,'sci-fi')},
  {id:'comedy',name:'Open Comedy',icon:'😄',match:x=>tagged(x,'comedy')},
  {id:'fantasy',name:'Open Fantasy',icon:'🐉',match:x=>tagged(x,'fantasy')},
  {id:'shorts',name:'Open Shorts',icon:'🎞',match:x=>tagged(x,'shorts')},
  {id:'all-open',name:'Open Entertainment',icon:'◈',match:()=>true}
 ];
 const valid=x=>x.rightsStatus==='verified_open'&&x.type==='youtube_embed'&&/^[A-Za-z0-9_-]{11}$/.test(x.videoId||'');
 open=open.filter(valid);
 function play(p){const b=[...document.querySelectorAll('#vodLibrary button')].find(x=>x.dataset.videoid===p.videoId);if(b)b.click();else status.textContent='Program is admitted but the VOD rail has not loaded it yet.'}
 function tune(c){
  const items=open.filter(c.match);rail.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.channel===c.id)));
  queue.replaceChildren();status.textContent=c.name+' · '+items.length+' rights-verified program'+(items.length===1?'':'s')+' · continuous playlist channel';
  if(!items.length){queue.textContent='This channel is waiting for more admitted programming.';return}
  items.forEach((p,i)=>{const b=document.createElement('button');b.textContent=(i+1)+'. '+p.title+' · '+(p.license||'open');b.onclick=()=>play(p);queue.append(b)});
  window.portalVirtualQueue=items;window.portalVirtualIndex=0;window.portalVirtualChannel=c.id;
 }
 for(const c of channels){const b=document.createElement('button');b.dataset.channel=c.id;b.textContent=c.icon+' '+c.name;b.onclick=()=>tune(c);rail.append(b)}
 root.querySelector('#networkStart').onclick=()=>{const items=window.portalVirtualQueue||[];if(!items.length){status.textContent='Choose a PORTAL channel first.';return}window.portalVirtualIndex=0;play(items[0])};
 root.querySelector('#networkNext').onclick=()=>{const items=window.portalVirtualQueue||[];if(!items.length)return;window.portalVirtualIndex=((window.portalVirtualIndex||0)+1)%items.length;play(items[window.portalVirtualIndex])};
 status.textContent=open.length+' rights-verified programs available to the PORTAL network.';
 tune(channels[0]);
})();