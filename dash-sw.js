// يخزّن هيكل التطبيق فقط، ولا يخزّن أي بيانات من Firebase
const V="zdash-v3";
const SHELL=["./index.html","./dash-manifest.webmanifest","./dash-icon-192.png","./dash-icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("zdash-")&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET")return;
 const font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
 const page=new URL("./index.html",self.registration.scope).pathname,root=new URL("./",self.registration.scope).pathname;
 const isPage=u.origin===location.origin&&(u.pathname===page||u.pathname===root);
 const isAsset=u.origin===location.origin&&SHELL.some(p=>new URL(p,self.registration.scope).pathname===u.pathname);
 if(!(font||isPage||isAsset))return;
 const key=isPage?"./index.html":r;
 // الشبكة أولاً حتى تظهر التحديثات، والنسخة المخزنة عند انقطاع الإنترنت
 e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const c=res.clone();e.waitUntil(caches.open(V).then(x=>x.put(key,c)))}return res})
  .catch(()=>caches.match(key).then(m=>m||Response.error())));
});

// الضغط على الإشعار: يفتح اللوحة ويعرض الحجز
self.addEventListener("notificationclick",e=>{
 e.notification.close();
 const id=(e.notification.data&&e.notification.data.id)||"";
 e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
  for(const c of list){if("focus" in c){c.postMessage({type:"open-booking",id});return c.focus()}}
  return self.clients.openWindow("./index.html");
 }));
});
