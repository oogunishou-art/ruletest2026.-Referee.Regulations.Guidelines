// Service Worker - JBA競技規則2026学習アプリ
// キャッシュバージョン：更新のたびにこの番号を上げる
const CACHE_VERSION = 'jba-2026-v4';
const CACHE_FILES = ['./', './index.html'];

// インストール：最低限のファイルをキャッシュ
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_VERSION; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// フェッチ：ネットワーク優先、失敗時にキャッシュにフォールバック
self.addEventListener('fetch', function(e) {
  // index.htmlは常にネットワークから取得（最新版を確保）
  if (e.request.url.endsWith('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        // 成功したらキャッシュを更新
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        // オフライン時はキャッシュから返す
        return caches.match(e.request);
      })
    );
  } else {
    // その他：キャッシュ優先
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        return cached || fetch(e.request);
      })
    );
  }
});
