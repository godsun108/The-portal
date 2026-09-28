// PORTAL STATION NAV // public-room hierarchy from stations.json
(async()=>{try{
  const here=location.pathname.replace(/\/index\.html$/,"/"),root=here.includes("/The-portal/")?here.split("/The-portal/")[0]+"/The-portal/":"/";
  const rel=here.startsWith(root)?here.slice(root.length):"";
  if(!rel||rel==="stations/")return;
  const r=await fetch(root+"stations.json",{cache:"no-store"});if(!r.ok)return;const d=await r.json();
  let parent=null;for(const s of d.stations||[])if((s.rooms||[]).some(x=>x[1]===rel)){parent=s;break}if(!parent)return;
  const stationURL=root+"?station="+encodeURIComponent(parent.id);
  document.querySelectorAll("a.back").forEach(a=>{if(/PORTAL|STATION/i.test(a.textContent)){a.href=stationURL;a.textContent="← "+parent.label}});
  const bar=document.querySelector(".bar a:first-child");if(bar&&/PORTAL/i.test(bar.textContent)){bar.href=stationURL;bar.textContent="← "+parent.label}
  document.documentElement.dataset.portalStation=parent.id;
}catch(e){}})();
