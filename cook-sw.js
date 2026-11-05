const CACHE='youtube-tools-conti-v8-fresh-html';
const FILES=['./','./index.html','./cook-conti.html','./assets/editor.js','./assets/sketch.js','./assets/conti.js','./assets/github.js','./assets/conti.css'];
const URLS=new Set(FILES.map(p=>new URL(p,self.location).href));
// 화면(HTML)은 온라인이면 새로 받고(3초 안에 응답 없으면 저장본), 오프라인이면 저장본. 스크립트·스타일은 저장본 우선.
const PAGES=new Set(['./','./index.html','./cook-conti.html'].map(p=>new URL(p,self.location).href));
// 새 버전은 기다리지 않고 바로 적용한다(아이폰 사파리가 예전 버전을 오래 붙잡는 문제).
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(file=>new Request(file,{cache:'reload'})))))});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('youtube-tools-conti-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
async function freshPage(request,key){
 const cache=await caches.open(CACHE);
 try{
  const res=await Promise.race([fetch(request,{cache:'no-cache'}),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),3000))]);
  if(res&&res.ok){await cache.put(key,res.clone());return res}
  return (await cache.match(key))||res;
 }catch{return (await cache.match(key))||Response.error()}
}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);u.search='';u.hash='';if(e.request.method!=='GET'||!URLS.has(u.href))return;
 e.respondWith(PAGES.has(u.href)?freshPage(e.request,u.href):caches.open(CACHE).then(async c=>(await c.match(u.href))||fetch(e.request)))});
