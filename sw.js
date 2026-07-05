/**
 * ARCHITECTURAL LAYER: OFFLINE SERVICE WORKER ROTATION ENGINE
 * Handles instant local caching for application files and components.
 */

const CACHE_NAME = 'efikcoin-core-v1.0.0';

// Array matching the exact asset paths from our modular design matrix
const IMMUTABLE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/architecture-core.css',
    './js/app-router.js',
    './js/wallet-vault.js',
    './js/blockchain-engine.js',
    './js/tx-sign-splitter.js',
    './js/p2p-desk.js',
    './js/dex-router.js',
    './assets/efc-logo-192.png',
    './assets/efc-logo-512.png'
];

// 1. INSTALLATION EVENT: Build isolated static application boundaries
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Hydrating memory cache with immutable assets...');
                return cache.addAll(IMMUTABLE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATION EVENT: Clean out deprecated cache historical indexes
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((existingCache) => {
                    if (existingCache !== CACHE_NAME) {
                        console.log('[Service Worker] Purging legacy cache index:', existingCache);
                        return caches.delete(existingCache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH EVENT: High-speed local cache injection pattern (Cache-First)
self.addEventListener('fetch', (event) => {
    // Ignore cross-origin setups or dynamic third-party RPC connections
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Return cache instantly for immediate performance
                }
                
                return fetch(event.request).then((networkResponse) => {
                    // Check for valid response status before updating cache dynamically
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                });
            }).catch(() => {
                // Failsafe error bypass handler
                console.error('[Service Worker] Resource routing fetch error.');
            })
    );
});

