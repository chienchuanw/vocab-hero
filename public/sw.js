/**
 * Service Worker for Vocab Hero
 * 處理推送通知、快取策略、離線支援
 */

const CACHE_NAME = 'vocab-hero-v1';
const STATIC_CACHE = 'vocab-hero-static-v1';

// 需要快取的靜態資源
const STATIC_ASSETS = [
  '/',
  '/globals.css',
  '/favicon.ico',
];

/**
 * Install Event
 * 當 Service Worker 首次安裝時觸發
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // 強制啟用新的 Service Worker
      return self.skipWaiting();
    })
  );
});

/**
 * Activate Event
 * 當 Service Worker 被啟用時觸發
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 刪除舊版本的快取
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即控制所有頁面
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event
 * 攔截網路請求，實作快取策略
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理同源請求
  if (url.origin !== location.origin) {
    return;
  }

  // API 請求使用 Network First 策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 快取成功的 API 回應
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 網路失敗時，嘗試從快取取得
          return caches.match(request);
        })
    );
    return;
  }

  // 靜態資源使用 Cache First 策略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // 只快取成功的 GET 請求
        if (request.method === 'GET' && response.ok) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

/**
 * Push Event
 * 接收推送通知
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  let notificationData = {
    title: 'Vocab Hero',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'default',
    data: {},
  };

  // 解析推送資料
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || data.type || notificationData.tag,
        data: data,
      };
    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.data.priority === 'HIGH',
    })
  );
});

/**
 * Notification Click Event
 * 處理使用者點擊通知的行為
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = '/';

  // 根據通知類型決定導向的頁面
  switch (notificationData.type) {
    case 'GOAL_ACHIEVED':
    case 'MILESTONE_REACHED':
      targetUrl = '/progress';
      break;
    case 'STREAK_WARNING':
      targetUrl = '/progress';
      break;
    case 'STUDY_REMINDER':
      targetUrl = '/study';
      break;
    case 'FREEZE_USED':
      targetUrl = '/progress';
      break;
    default:
      targetUrl = '/';
  }

  // 開啟或聚焦到目標頁面
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 檢查是否已有開啟的視窗
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }

      // 如果沒有，開啟新視窗
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

