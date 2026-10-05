// PORTAL TV Programming Director: transparent, client-side, no fabricated schedules.
(async function(){
 const root=document.getElementById('programmingDirector');if(!root)return;
 const search=root.querySelector('#directorSearch'),filter=root.querySelector('#directorCategory'),results=root.querySelector('#directorResults'),count=root.querySelector('#directorCount');
 let programs=[];try{const r=await fetch('tv-programs.json?v=33',{cache:'no-store'});if(r.ok)programs=(await r.json()).programs||[]}catch{}
 const official=(window.PORTAL_TV_CATALOG?.entries||[]).map(x=>({...x,kind:'official'}));
 const live=programs.filter(x=>x.type==='hls'&&x.live).map(x=>({...x,kind:'direct'}));
 const options=[...live,...official];const cats=[...new Set(options.map(x=>x.genre||x.category))].sort();
 for(const name of cats){const o=document.createElement('option');o.value=o.textContent=name;filter.append(o)}
 const isVerified=x=>x.kind==='direct'&&x.deviceConfirmed;
 function draw(){
  const q=search.value.trim().toLowerCase(),cat=filter.value;
  const selected=options.filter(x=>(!cat||(x.genre||x.category)===cat)&&[x.title,x.genre,x.category,x.description,x.provider].join(' ').toLowerCase().includes(q));
  selected.sort((a,b)=>Number(isVerified(b))-Number(isVerified(a))||Number(b.kind==='direct')-Number(a.kind==='direct')||a.title.localeCompare(b.title));
  results.replaceChildren();count.textContent=selected.length+' options · '+selected.filter(isVerified).length+' previously iPhone-tested live channels · official links are not embedded feeds';
  for(const x of selected){
   const item=document.createElement('article');item.style.cssText='padding:12px;background:#142338;border:1px solid #4a6c7d;border-radius:10px';
   const title=document.createElement('strong'),detail=document.createElement('small'),button=document.createElement(x.kind==='direct'?'button':'a');
   title.textContent=x.title;detail.style.cssText='display:block;margin:5px 0 10px';detail.textContent=(x.genre||x.category)+' · '+(isVerified(x)?'✓ Previously played on iPhone':x.kind==='direct'?'Unverified direct stream':'Official provider destination; access varies');
   button.textContent=x.kind==='direct'?'▶ Watch in Portal':'Open official service ↗';
   if(x.kind==='direct'){button.onclick=()=>{const match=[...document.querySelectorAll('#watchNow button')].find(b=>b.dataset.streamurl===x.url);if(match)match.click();else if(window.portalTune)window.portalTune({name:x.title,url:x.url,category:x.genre});else alert('The live tuner has not loaded yet.')}}else{button.href=x.url;button.target='_blank';button.rel='noopener noreferrer';button.style.cssText='display:inline-block;color:#80e9dd;padding:8px'}
   item.append(title,detail,button);results.append(item);
  }
 }
 search.addEventListener('input',draw);filter.addEventListener('change',draw);root.querySelectorAll('[data-director-preset]').forEach(b=>b.addEventListener('click',()=>{search.value=b.dataset.directorPreset;filter.value='';draw()}));draw();
})();