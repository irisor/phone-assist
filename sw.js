const CACHE_NAME = 'phone-assist-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/components.css',
    './js/app.js',
    './js/services/transcriptionService.js',
    './js/services/translationService.js',
    './js/components/audioVisualizer.js',
    './js/components/conversationHistory.js',
    './js/store/conversationStore.js',
    './js/utils/debugLogger.js',
    './js/utils/textFormatter.js',
    './assets/logo.png',
    './assets/favicon.png'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

// Fetch Event (Network First, fall back to Cache)
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like translation API)
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});

// Activate Event (Clean up old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});
