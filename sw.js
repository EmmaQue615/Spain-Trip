// Service Worker：缓存壳页面（加密 HTML），刷新时先从缓存秒开，后台再更新
// CACHE 名带版本号，sw.js 内容变化时浏览器会自动完成新旧 SW 替换
var CACHE = 'es2026-shell-v1';

self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(clients.claim()); });

self.addEventListener('fetch', function(e){
  var r = e.request;
  if (r.method !== 'GET') return;
  var url = new URL(r.url);
  if (url.origin !== location.origin) return;  // Firebase 等跨域请求不拦截
  if (r.mode !== 'navigate' && !/\.html$/.test(url.pathname)) return;
  e.respondWith(
    caches.open(CACHE).then(function(c){
      return c.match(r, { ignoreSearch: true }).then(function(hit){
        var net = fetch(r).then(function(resp){
          if (resp.ok) c.put(r, resp.clone());
          return resp;
        }).catch(function(){ return hit; });
        return hit || net;   // 有缓存先回缓存，网络在后台更新；无缓存等网络
      });
    })
  );
});
