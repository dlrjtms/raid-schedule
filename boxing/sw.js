const C='last-round-v99',FONTS='last-round-fonts';const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const FONT_CSS='https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&family=Teko:wght@500;600;700&display=swap';
self.addEventListener('install',e=>{
  // fonts are fetched alongside, never holding up the install (a slow font server must not stop the game from caching)
  caches.open(FONTS).then(c=>c.match(FONT_CSS).then(r=>r||fetch(FONT_CSS,{mode:'no-cors'}).then(res=>c.put(FONT_CSS,res)))).catch(()=>{});
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
// game caches are replaced on every version; the font cache is kept so the scoreboard lettering works offline
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==FONTS).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){ // cache-first; whatever glyph files the page has used once stay available offline
    e.respondWith(caches.open(FONTS).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))).catch(()=>new Response('',{status:504})));return}
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&u.origin===location.origin){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('./index.html'))))});
