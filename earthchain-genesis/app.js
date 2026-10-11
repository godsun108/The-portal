"use strict";
const modules=[
["EarthID","♙","Not connected","Shared authentication and profiles require verified backend contracts."],
["EarthWallet","◈","Not connected","No wallet provider, custody model, or EarthCoin contract has been verified. No balances or transfers are shown."],
["EarthPlay","✦","Not connected","Existing game implementation and reward settlement are not yet located."],
["EarthMarket","▣","Not connected","Catalog, USD checkout, and fulfillment adapters require verified implementations."],
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
   const existing=document.createElement("a");
   existing.className="discovery";
   existing.href="../games/starfall/commerce/direct.html";
   existing.textContent="Open existing ECTEST wallet & checkout";
   existing.rel="noopener";
   detailPanel.append(existing);
   const create=document.createElement("a");
   create.className="discovery";
   create.href="../earthchain-test/no-server.html";
   create.textContent="Create or restore existing test wallet";
   create.rel="noopener";
   detailPanel.append(create);
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
