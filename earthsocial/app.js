"use strict";
// Fictional placeholders only. No user data, network calls, or social graph storage.
const feeds={
 circle:{heading:"Friends & Family",note:"The people closest to you, in a dedicated chronological feed.",posts:[
  {name:"Family album",avatar:"🏡",when:"Example · Today",photo:"🌻",caption:"A little moment from the garden. The kind of memory worth keeping.",audience:"Example audience: Friends & Family"},
  {name:"Close friends",avatar:"💚",when:"Example · Yesterday",photo:"🌅",caption:"Weekend memories by the water.",audience:"Example audience: Close friends"}
 ]},
 following:{heading:"Following",note:"Updates from accounts you choose to follow, separate from your inner circle.",posts:[
  {name:"Creative studio",avatar:"🎨",when:"Example · Today",photo:"🎭",caption:"A new project is taking shape.",audience:"Example account: Creator"},
  {name:"Nature journal",avatar:"🌿",when:"Example · Yesterday",photo:"🌎",caption:"A field note from the restoration project.",audience:"Example account: Organization"}
 ]}
};
const root=document.getElementById("feed");const buttons=[...document.querySelectorAll("[data-feed]")];
function render(which){const data=feeds[which];if(!data)return;for(const button of buttons){const active=button.dataset.feed===which;button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));}root.replaceChildren();const title=document.createElement("h2");title.className="feed-heading";title.textContent=data.heading;const note=document.createElement("p");note.className="feed-note";note.textContent=data.note;root.append(title,note);for(const item of data.posts){const card=document.createElement("article");card.className="post";const header=document.createElement("div");header.className="post-header";const avatar=document.createElement("span");avatar.className="avatar";avatar.textContent=item.avatar;const info=document.createElement("div");const name=document.createElement("strong");name.textContent=item.name;const time=document.createElement("small");time.textContent=item.when;info.append(name,time);header.append(avatar,info);const photo=document.createElement("div");photo.className="photo-placeholder";photo.setAttribute("role","img");photo.setAttribute("aria-label","Decorative example image placeholder");photo.textContent=item.photo;const body=document.createElement("div");body.className="post-body";const caption=document.createElement("p");caption.textContent=item.caption;const audience=document.createElement("small");audience.textContent=item.audience;body.append(caption,audience);card.append(header,photo,body);root.append(card);}}
for(const button of buttons)button.addEventListener("click",()=>render(button.dataset.feed));render("circle");
