const C='legion-raid-v1',FONTS='legion-raid-fonts';const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const FONT_CSS='https://fonts.googleapis.com/css2?family=Song+Myung&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap';
self.addEventListener('install',e=>{
  caches.open(FONTS).then(c=>c.match(FONT_CSS).then(r=>r||fetch(FONT_CSS,{mode:'no-cors'}).then(res=>c.put(FONT_CSS,res)))).catch(()=>{});
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
// 게임 캐시는 버전마다 교체, 글꼴 캐시는 유지해서 오프라인에서도 글씨가 깨지지 않게 한다
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==FONTS).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res}))).catch(()=>new Response('',{status:504})));return}
  if(u.origin!==location.origin)return; // 순위표(Firebase) 등 외부 요청은 그대로 네트워크로
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res}).catch(()=>caches.match('./index.html'))))});
