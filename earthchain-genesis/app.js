"use strict";
const modules=[
["EarthID","♙","Not connected","Shared authentication and profiles require verified backend contracts."],
["EarthWallet","◈","Existing ECTEST trial","Existing test wallet and hosted checkout are available in the Portal. No real funds or EarthCoin contract are connected."],
["EarthPlay","✦","Existing Starfall game","Starfall is available in the Portal. Gameplay and signed test collectible ownership remain in their existing modules."],
["EarthMarket","▣","Test collectibles only","Existing Starfall checkout supports valueless ECTEST collectibles. USD storefront and physical-goods commerce are not connected."],
["EarthTV","▷","Candidate integration","The Portal has a documented public experience layer; video service integration is not verified."],
["EarthSocial","◎","Planned","Profiles, posts, communities and moderation are not implemented in this preview."],
["EarthConnect","✉","Planned","Private messaging requires identity, permissions and abuse safeguards."],
["EarthSound","♫","Planned","Licensed music distribution and playback are not connected."],
["EarthMind","✳","Candidate integration","Sovereign Core documents model-neutral contracts; live inference is not verified here."],
["EarthLibrary","▤","Planned","Licensed and public-domain knowledge catalog is not connected."],
["EarthPress","◉","Planned","Editorial provenance and reporting integrations are not connected."],
["EarthStudio","◇","Candidate integration","Virtual Human Engine documents creator workflows; no publishing integration is verified."],
["EarthSteward","❀","Planned","Environmental project verification and reporting are not connected."],
["EarthMesh","⌁","Planned","Offline app shell is a foundation target; peer-to-peer networking is not implemented."]
];
const grid=document.getElementById("modules");const detail=document.getElementById("detail");
for(const [name,symbol,status,description] of modules){const button=document.createElement("button");button.type="button";button.className="module";const symbolNode=document.createElement("span");symbolNode.className="symbol";symbolNode.textContent=symbol;const heading=document.createElement("strong");heading.textContent=name;const state=document.createElement("span");state.className="status";state.textContent=status;button.append(symbolNode,heading,state);button.addEventListener("click",()=>{detail.replaceChildren();const title=document.createElement("h2");title.textContent=name+" · "+status;const paragraph=document.createElement("p");paragraph.textContent=description;detail.append(title,paragraph);detail.scrollIntoView({behavior:"smooth",block:"nearest"});});grid.append(button);}
/* Reuse Portal experiences on the same origin; no wallet keys or balances are copied. */
const routes={
 EarthPlay:[["Play Starfall","../games/starfall/"]],
 EarthMarket:[["Starfall test collectible marketplace","../games/starfall/commerce/direct.html"]],
 EarthWallet:[["Open existing ECTEST wallet & checkout","../games/starfall/commerce/direct.html"],["Create or restore existing test wallet","../earthchain-test/no-server.html"]]
};
for(const button of grid.querySelectorAll(".module")){
 const name=button.querySelector("strong")?.textContent;
 if(!routes[name])continue;
 button.addEventListener("click",()=>{
  for(const [label,href] of routes[name]){
   const link=document.createElement("a");
   link.className="discovery";
   link.href=href;
   link.rel="noopener";
   link.textContent=label;
   detail.append(link);
  }
 });
}
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}

/* Explicit opt-in, read-only test checkout discovery. No wallet credentials or mutations. */
if(typeof window!=="undefined"){
 const detailPanel=document.getElementById("detail");
 const walletButtons=[...document.querySelectorAll(".module")];
 for(const button of walletButtons){
  if(button.querySelector("strong")?.textContent!=="EarthWallet")continue;
  button.addEventListener("click",()=>{
   const action=document.createElement("button");
   action.type="button";
   action.className="discovery";
   action.textContent="Check ECTEST service (read-only)";
   detailPanel.append(action);
   const probe=document.createElement("button");
   probe.type="button";
   probe.className="discovery";
   probe.textContent="Check iPhone signing support";
   detailPanel.append(probe);
   const dashboard=document.createElement("section");
   dashboard.className="wallet-snapshot";
   dashboard.setAttribute("aria-label","Verified ECTEST wallet snapshot");
   const title=document.createElement("h3");
   title.textContent="Your ECTEST dashboard";
   const status=document.createElement("p");
   status.setAttribute("role","status");
   status.textContent="Checking locally saved signed view…";
   dashboard.append(title,status);
   detailPanel.append(dashboard);
   const controls=document.createElement("div");
   controls.className="wallet-actions";
   const reload=document.createElement("button");
   reload.type="button";reload.className="discovery";reload.textContent="Recheck signed snapshot";
   const refreshLink=document.createElement("a");
   refreshLink.className="discovery";refreshLink.href="../games/starfall/commerce/direct.html";
   refreshLink.textContent="Refresh ownership in Starfall checkout";
   controls.append(reload,refreshLink);dashboard.append(controls);
   const showSnapshot=async()=>{
    reload.disabled=true;status.textContent="Verifying saved signed snapshot…";
    for(const node of [...dashboard.querySelectorAll(".wallet-data")])node.remove();
    try{
     const {cachedTestWalletSnapshot}=await import("./wallet-dashboard.mjs");
     const snap=await cachedTestWalletSnapshot();
     if(!dashboard.isConnected)return;
     if(snap.state==="verified"){
      status.textContent=snap.balance+" ECTEST · signed test snapshot · expires "+new Date(snap.expiresAt).toLocaleTimeString();
      const address=document.createElement("p");address.className="wallet-data";
      address.textContent="Test address: "+snap.address;dashboard.insertBefore(address,controls);
      const heading=document.createElement("h4");heading.className="wallet-data";
      heading.textContent="Verified Starfall hulls";dashboard.insertBefore(heading,controls);
      const gallery=document.createElement("div");gallery.className="wallet-data hull-gallery";
      const hulls={"solar-lion":["☀","Solar Lion"],"fire-horse":["♞","Fire Horse"],"earth-steward":["✿","Earth Steward"]};
      if(!snap.skins.length){const empty=document.createElement("p");empty.textContent="No owned Starfall hulls in this signed view.";gallery.append(empty);}
      for(const item of snap.skins){
       const id=item.skinId;
       if(!hulls[id])continue;
       const card=document.createElement("article");card.className="hull-card";
       const symbol=document.createElement("span");symbol.className="hull-icon";symbol.textContent=hulls[id][0];
       const name=document.createElement("strong");name.textContent=hulls[id][1];
       const verified=document.createElement("small");verified.textContent="Verified owned · ECTEST test collectible";
       const play=document.createElement("a");play.href="../games/starfall/";play.textContent="Play Starfall →";
       const equip=document.createElement("button");
       equip.type="button";equip.className="hull-equip";
       const selected=()=>{try{return JSON.parse(localStorage.getItem("earthchain.starfall.hosted.v1")||"null")?.preferredToken===item.tokenId}catch{return false}};
       equip.textContent=selected()?"Selected for Starfall":"Equip for Starfall";
       equip.addEventListener("click",()=>{
        try{
         const raw=localStorage.getItem("earthchain.starfall.hosted.v1");
         const stored=JSON.parse(raw||"null");
         if(!stored?.envelope||stored.envelope.view?.expiresAt<=Date.now()||stored.envelope.view?.count!==snap.count||stored.envelope.view?.head!==snap.head){
          status.textContent="Signed view changed or expired. Recheck snapshot before equipping.";return;
         }
         localStorage.setItem("earthchain.starfall.hosted.v1",JSON.stringify({...stored,preferredToken:item.tokenId}));
         for(const b of gallery.querySelectorAll(".hull-equip"))b.textContent="Equip for Starfall";
         equip.textContent="Selected for Starfall";
         status.textContent="Selected "+hulls[id][1]+" locally. Open Starfall to play. No purchase or transfer.";
        }catch{status.textContent="Could not save hull selection on this device."}
       });
       card.append(symbol,name,verified,equip,play);gallery.append(card);
      }
      dashboard.insertBefore(gallery,controls);
     }else{
      status.textContent=snap.state==="not_connected"?"No saved signed view on this device. Connect through Starfall checkout first.":snap.state==="expired"?"Signed view expired (five-minute lifetime). Refresh ownership in Starfall checkout and return.":"Cannot verify saved view ("+snap.state+"). Use the existing checkout to refresh it.";
     }
    }catch{status.textContent="Snapshot check unavailable. Existing wallet remains unchanged."}
    finally{reload.disabled=false;}
   };
   reload.addEventListener("click",showSnapshot);
   showSnapshot();
   probe.addEventListener("click",async()=>{
    probe.disabled=true;
    const result=document.createElement("p");
    result.setAttribute("role","status");
    detailPanel.append(result);
    try{
     const {probeWalletCrypto}=await import("./wallet-capability.mjs");
     const outcome=await probeWalletCrypto();
     result.textContent=outcome.supported?"Ed25519 signing and verification supported. No wallet connected; temporary key discarded.":"Wallet signing unavailable: "+outcome.reason+". No wallet connected.";
    }catch{
     result.textContent="Unable to check signing support. No wallet connected.";
    }finally{
     probe.disabled=false;
    }
   });
   action.addEventListener("click",async()=>{
    action.disabled=true;
    action.textContent="Checking…";
    const result=document.createElement("p");
    result.setAttribute("role","status");
    detailPanel.append(result);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    try{
     const {discoverTestCheckout}=await import("./earthchain-adapter.mjs");
     const info=await discoverTestCheckout(fetch,{signal:controller.signal});
     result.textContent="ECTEST discovery verified: "+info.network+". Test points only; wallet not connected.";
    }catch{
     result.textContent="ECTEST discovery unavailable from this browser. No wallet was connected and no transaction was attempted.";
    }finally{
     clearTimeout(timeout);
     action.disabled=false;
     action.textContent="Check again (read-only)";
    }
   });
  });
 }
}
