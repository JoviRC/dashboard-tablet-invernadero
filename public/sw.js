// Service Worker para notificaciones push en web
/* eslint-env serviceworker */

// Install
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

// Push
self.addEventListener('push', (event) => {
  console.log('Notificación push recibida:', event);
  
  const options = {
    body: 'Alerta del invernadero',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'greenhouse-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || 'Alerta del Invernadero';
      options.body = data.body || data.message || 'Nueva notificación';
      options.data = data;
    } catch (error) {
      console.error('Error parsing push data:', error);
      options.title = 'Alerta del Invernadero';
      options.body = event.data.text() || 'Nueva notificación';
    }
  } else {
    options.title = 'Alerta del Invernadero';
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clients) {
          if (client.url.includes('localhost:3000') && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync (opcional)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
});
