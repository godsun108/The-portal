"use strict";
// Same-origin navigation only. This module does not authenticate, transact or copy wallet data.
const destinations=[
 {title:"Genesis",subtitle:"Super-app modules",href:"./",status:"Preview"},
 {title:"Starfall",subtitle:"Play the existing game",href:"../games/starfall/",status:"Available"},
 {title:"Asset Foundry",subtitle:"Create and share game assets",href:"../games/starfall/assets/",status:"Available"},
 {title:"ECTEST Wallet",subtitle:"Existing test wallet",href:"../earthchain-test/no-server.html",status:"Test only"},
 {title:"Test Checkout",subtitle:"Starfall collectible checkout",href:"../games/starfall/commerce/direct.html",status:"Test only"},
 {title:"PORTAL TV",subtitle:"Explore the existing TV page",href:"../tv.html",status:"Existing page"},
 {title:"EarthLibrary",subtitle:"Read Alice and open local text ebooks",href:"./books/",status:"Reader preview"}
];
const root=document.getElementById("superapp-nav");
if(root){
 const heading=document.createElement("h2");heading.textContent="Your connected Portal";
 const description=document.createElement("p");description.textContent="One place to open existing experiences. These links do not imply shared sign-in, production payments or live service integration.";
 const links=document.createElement("div");links.className="superapp-links";
 for(const item of destinations){
  const link=document.createElement("a");link.className="superapp-link";link.href=item.href;
  const label=document.createElement("strong");label.textContent=item.title;
  const subtitle=document.createElement("small");subtitle.textContent=item.subtitle;
  const status=document.createElement("span");status.textContent=item.status;
  link.append(label,subtitle,status);links.append(link);
 }
 root.append(heading,description,links);
}
