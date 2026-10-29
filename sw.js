/**
 * @file sw.js
 * @description Service Worker para suporte PWA e modo offline no Bichos & Ossos.
 */

const CACHE_NAME = 'bichos-e-ossos-v1.2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './utils.js',
    './definitions.js',
    './registry.js',
    './classes.js',
    './ui.js',
    './logic.js',
    './main.js',
    './icon.png',
    './icon.ico'
];

// Instalação: Pré-cacheia os arquivos principais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cacheando assets principais...');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => {
                    console.log('[SW] Removendo cache obsoleto:', key);
                    return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Estratégia Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
    // Ignora requisições que não sejam GET ou sejam externas (ex: tailwindcdn/google fonts)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta for válida e da mesma origem, armazena em cache dinâmico
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se estiver offline ou a rede falhar, busca no cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

