"use strict";
const CACHE="earthchain-genesis-preview-v3";
const ASSETS=["./","./index.html","./style.css","./app.js","./earthchain-adapter.mjs","./manifest.webmanifest","./command-center.html"];
const BASE=new URL("./",self.registration.scope);
const ALLOWED_PATHS=new Set(ASSETS.map(asset=>new URL(asset,BASE).pathname));
const COMMAND_PATH=new URL("command-center.html",BASE).pathname;
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("earthchain-genesis-preview-")&&key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||req.mode==="navigate"&&new URL(req.url).pathname!==BASE.pathname&&new URL(req.url).pathname!==new URL("index.html",BASE).pathname&&new URL(req.url).pathname!==COMMAND_PATH)return;
 if(req.credentials!=="omit"&&req.mode!=="navigate")return;
 const url=new URL(req.url);
 if(url.origin!==BASE.origin||!ALLOWED_PATHS.has(url.pathname)||url.search)return;
 // Precached immutable shell only. Never persist runtime responses or authenticated content.
 event.respondWith(fetch(req).catch(()=>caches.match(req).then(hit=>hit||Response.error())));
});
