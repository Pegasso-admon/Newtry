const CACHE_NAME = 'evenup-v1.0.0';
const BASE_PATH = '/Newtry'; // Replace with your repo name

const urlsToCache = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/index.html`,
    `${BASE_PATH}/login.html`,
    `${BASE_PATH}/signup.html`,
    `${BASE_PATH}/balances.html`,
    `${BASE_PATH}/dashboard.html`,
    `${BASE_PATH}/ui.html`,
    `${BASE_PATH}/css/styles.css`,
    `${BASE_PATH}/css/theme.css`,
    `${BASE_PATH}/js/main.js`,
    `${BASE_PATH}/js/auth.js`,
    `${BASE_PATH}/js/balances.js`,
    `${BASE_PATH}/js/expenses.js`,
    `${BASE_PATH}/js/pwa.js`,
    `${BASE_PATH}/media/evenup.ico`,
    `${BASE_PATH}/media/evenup_image.png`,
    `${BASE_PATH}/media/hero_image.jpg`,
    // PWA Icons
    `${BASE_PATH}/media/icons/evenup-192x192.png`,
    `${BASE_PATH}/media/icons/evenup-512x512.png`,
    // CDN resources
    'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.4/css/bulma.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('All resources cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Cache failed:', error);
                // Continue anyway
                return self.skipWaiting();
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Cache cleanup complete');
            return self.clients.claim();
        })
    );
});

// Fetch event with GitHub Pages specific handling
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(fetchResponse => {
                    // Check if we received a valid response
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }

                    // Clone the response
                    const responseToCache = fetchResponse.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return fetchResponse;
                });
            })
            .catch(() => {
                // Offline fallback
                if (event.request.destination === 'document') {
                    return caches.match(`${BASE_PATH}/index.html`) ||
                        caches.match(`${BASE_PATH}/index.html`);
                }
            })
    );
});