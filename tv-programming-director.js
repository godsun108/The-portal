// PORTAL TV Programming Director: transparent, client-side, no fabricated schedules.
(async function(){
 const root=document.getElementById('programmingDirector');if(!root)return;
 const search=root.querySelector('#directorSearch'),filter=root.querySelector('#directorCategory'),results=root.querySelector('#directorResults'),count=root.querySelector('#directorCount');
 let programs=[],open=[];
 try{
  const [base,curated]=await Promise.all([
   fetch('tv-programs.json?v=38',{cache:'no-store'}).then(r=>r.ok?r.json():({programs:[]})),
   fetch('tv-open-library.json?v=1',{cache:'no-store'}).then(r=>r.ok?r.json():({programs:[]})).catch(()=>({programs:[]}))
  ]);
  programs=base.programs||[];open=curated.programs||[];
 }catch{}
 const official=(window.PORTAL_TV_CATALOG?.entries||[]).map(x=>({...x,kind:'official'}));
 const live=programs.filter(x=>x.type==='hls'&&x.live).map(x=>({...x,kind:'direct'}));
 const existing=new Set(programs.map(x=>x.videoId||x.url||x.source));
 const vod=[...programs.filter(x=>x.type==='youtube_embed'&&!x.live).map(x=>({...x,kind:'vod'})),...open.filter(x=>!existing.has(x.videoId||x.url||x.source)).map(x=>({...x,kind:'open'}))];
 const options=[...live,...vod,...official];const cats=[...new Set(options.map(x=>x.genre||x.category).filter(Boolean))].sort();
 for(const name of cats){const o=document.createElement('option');o.value=o.textContent=name;filter.append(o)}
 const isVerified=x=>x.kind==='direct'&&x.deviceConfirmed;
 const isOpen=x=>x.kind==='open'||x.rightsStatus==='verified_open';
 function draw(){
  const q=search.value.trim().toLowerCase(),cat=filter.value;
  const selected=options.filter(x=>(!cat||(x.genre||x.category)===cat)&&[x.title,x.genre,x.category,x.description,x.provider,x.license].join(' ').toLowerCase().includes(q));
  selected.sort((a,b)=>Number(isVerified(b))-Number(isVerified(a))||Number(isOpen(b))-Number(isOpen(a))||Number(b.kind!=='official')-Number(a.kind!=='official')||a.title.localeCompare(b.title));
  results.replaceChildren();count.textContent=selected.length+' options · '+selected.filter(isVerified).length+' iPhone-tested live · '+selected.filter(isOpen).length+' rights-verified open · '+selected.filter(x=>x.kind==='official').length+' official destinations';
  for(const x of selected){
   const item=document.createElement('article');item.style.cssText='padding:12px;background:#142338;border:1px solid #4a6c7d;border-radius:10px';
   const title=document.createElement('strong'),detail=document.createElement('small'),button=document.createElement(x.kind==='official'?'a':'button');
   title.textContent=x.title;detail.style.cssText='display:block;margin:5px 0 10px';
   detail.textContent=(x.genre||x.category)+' · '+(isVerified(x)?'✓ Previously played on iPhone':isOpen(x)?'◈ '+(x.license||'Open license')+' · rights verified':x.kind==='direct'?'Unverified direct stream':x.kind==='vod'?'In-Portal on demand':'Official provider destination; access varies');
   button.textContent=x.kind==='official'?'Open official service ↗':x.kind==='direct'?'▶ Watch live in Portal':'▶ Watch in Portal';
   if(x.kind==='direct'){button.onclick=()=>{const match=[...document.querySelectorAll('#watchNow button')].find(b=>b.dataset.streamurl===x.url);if(match)match.click();else if(window.portalTune)window.portalTune({name:x.title,url:x.url,category:x.genre});else alert('The live tuner has not loaded yet.')}}
   else if(x.kind==='vod'||x.kind==='open'){button.onclick=()=>{const id=x.videoId||x.url||x.source;const match=[...document.querySelectorAll('#vodLibrary button')].find(b=>(b.dataset.videoid||b.dataset.streamurl)===id);if(match)match.click();else alert('The on-demand library has not loaded this title yet.')}}
   else{button.href=x.url;button.target='_blank';button.rel='noopener noreferrer';button.style.cssText='display:inline-block;color:#80e9dd;padding:8px'}
   item.append(title,detail,button);results.append(item);
  }
 }
 search.addEventListener('input',draw);filter.addEventListener('change',draw);root.querySelectorAll('[data-director-preset]').forEach(b=>b.addEventListener('click',()=>{search.value=b.dataset.directorPreset;filter.value='';draw()}));draw();
})();