// Service Worker for DAT Angle Practice
// Provides offline functionality by caching static assets

const CACHE_NAME = 'dat-angle-practice-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/test',
  '/results',
  '/manifest.json',
  // Next.js static assets will be added dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        // Ensure the service worker takes control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache static assets and pages
                if (shouldCache(event.request.url)) {
                  console.log('Caching new resource:', event.request.url);
                  cache.put(event.request, responseToCache);
                }
              })
              .catch((error) => {
                console.error('Failed to cache resource:', error);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch failed, serving offline fallback:', error);
            
            // For navigation requests, serve the main page from cache
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // For other requests, return a basic offline response
            return new Response(
              JSON.stringify({ 
                error: 'Offline', 
                message: 'This resource is not available offline' 
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
  );
});

// Helper function to determine if a URL should be cached
function shouldCache(url) {
  // Cache static assets
  if (url.includes('/_next/static/')) {
    return true;
  }
  
  // Cache main pages
  if (url.endsWith('/') || url.endsWith('/test') || url.endsWith('/results')) {
    return true;
  }
  
  // Cache CSS and JS files
  if (url.endsWith('.css') || url.endsWith('.js')) {
    return true;
  }
  
  // Cache images and fonts
  if (url.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    return true;
  }
  
  return false;
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Notify clients when a new service worker is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker script loaded');