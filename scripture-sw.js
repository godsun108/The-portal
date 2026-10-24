/* Living Scriptures: deliberately narrow service-worker scope.
 * Cache only these public, same-origin scripture assets. Never intercept the rest of PORTAL.
 */
const VERSION='living-scriptures-v1';
const SHELL=['./living-scriptures.html','./scripture-reader.html','./scripture-compare.html'];
const qualifies=(url)=>{
 const u=new URL(url);
 if(u.origin!==self.location.origin)return false;
 const base=new URL('./',self.registration.scope).pathname;
 const relative=u.pathname.startsWith(base)?u.pathname.slice(base.length):null;
 return relative!==null&&(SHELL.some(p=>p.slice(2)===relative)||/^data\/web-chapters\/[A-Z0-9]{3,4}\/\d{3}\.json$/.test(relative)||relative==='data/web-chapters/manifest.json');
};
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 // The shell is a convenience; keep SW install successful even if not all pages are cached.
 await Promise.allSettled(SHELL.map(x=>cache.add(x)));
 await self.skipWaiting();
})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(x=>x.startsWith('living-scriptures-')&&x!==VERSION).map(x=>caches.delete(x)));
 await self.clients.claim();
})());});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||!qualifies(request.url))return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  const cached=await cache.match(request);
  if(cached)return cached;
  try{
    const response=await fetch(request);
    if(response.ok && response.type==='basic')await cache.put(request,response.clone());
    return response;
  }catch{
    return new Response('Scripture chapter is not stored on this device.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});
