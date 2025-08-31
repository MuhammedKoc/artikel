// Önbellek adını belirle. Versiyon numarası önemlidir.
const CACHE_STATIC_NAME = 'site-static-v1';
const CACHE_DYNAMIC_NAME = 'site-dynamic-v1';

// Statik (değişmeyecek) dosyaların listesi
const staticAssets = [
  '/', 
  '/index.html',
  '/Styles/style.css', // Düzeltildi
  '/Scripts/script.js', // Düzeltildi
  '/Pages/calendar.html', // Düzeltildi
  '/Styles/calendar.css', // Düzeltildi
  '/Scripts/calendar.js', // Düzeltildi
  '/Pages/other.html', // Düzeltildi
  '/Styles/other.css', // Düzeltildi
  '/Scripts/other.js', // Düzeltildi
  '/data.json',
  '/favicon.ico',
  '/afisler/' // afisler klasörü
];

// Olay dinleyici: Kurulum (Install)
// Service worker ilk yüklendiğinde çalışır.
self.addEventListener('install', event => {
  console.log('Service Worker: Kurulum başladı.');
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('Service Worker: Statik dosyalar önbelleğe alınıyor.');
        return cache.addAll(staticAssets);
      })
  );
});

// Olay dinleyici: Etkinleştirme (Activate)
// Yeni bir service worker aktifleştiğinde eski önbellekleri temizler.
self.addEventListener('activate', event => {
  console.log('Service Worker: Aktifleşme başladı.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_STATIC_NAME && cacheName !== CACHE_DYNAMIC_NAME) {
            console.log('Service Worker: Eski önbellek temizleniyor.', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Olay dinleyici: Veri Çekme (Fetch)
// Tarayıcı bir kaynak (dosya, API vb.) istediğinde çalışır.
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini ve HTTP(S) protokollerini yakala
  if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        // Önbellekte varsa doğrudan önbellekten döndür
        if (response) {
          return response;
        }

        // Önbellekte yoksa ağı kullanarak isteği yap
        return fetch(event.request).then(fetchResponse => {
          // Başarısız bir yanıtı (örn. 404, 500) önbelleğe alma
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Yanıtı klonla çünkü bir kere kullanılabilir
          const responseToCache = fetchResponse.clone();
          
          // Yanıtı dinamik önbelleğe kaydet
          caches.open(CACHE_DYNAMIC_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return fetchResponse;
        }).catch(() => {
          // Ağ bağlantısı yoksa ve önbellekte de yoksa...
          // Örneğin, bir çevrimdışı sayfa gösterebilirsin.
          // return caches.match('/offline.html');
        });
      })
    );
  }
});