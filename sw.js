// Service worker: app disponibile anche offline
const C='lrh26-v32', T='lrh26-tiles';
const CORE=['./','index.html','data.json','manifest.webmanifest','logo-icon-192.png','logo-icon-512.png','logo-icon-maskable-512.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  if(u.origin===location.origin){
    // pagina e dati: prima la rete (aggiornamenti), poi la copia salvata
    e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request.url.split('?')[0],cp));return r;})
      .catch(()=>caches.match(e.request.url.split('?')[0]).then(r=>r||caches.match('index.html'))));
    return;
  }
  // immagini satellitari del tornante: copia salvata se c'è, altrimenti rete e salvataggio
  if(/server\.arcgisonline\.com/.test(u.host)){
    e.respondWith(caches.open(T).then(c=>c.match(e.request.url).then(r=>r||fetch(e.request).then(n=>{c.put(e.request.url,n.clone());return n;}))));
    return;
  }
  // librerie e font: copia salvata se c'è
  if(/unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put(e.request,cp));return n;})));
  }
});
