// public/sw.js - SERVICE WORKER PARA RECEBER NOTIFICAÇÕES PUSH

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  console.log('Event:', event); // Use the event parameter here
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// ============================================
// RECEBER E EXIBIR NOTIFICAÇÃO PUSH
// ============================================
self.addEventListener('push', (event) => {
  console.log('📬 Notificação push recebida:', event);

  if (!event.data) {
    console.warn('⚠️ Push event sem dados');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('❌ Erro ao parsear dados do push:', e);
    return;
  }

  const title = data.title || '🚀 FreelinnkBrain';
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'freelinnkbrain-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/dashboard/brain',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: '📱 Abrir',
        icon: '/icon-check.png',
      },
      {
        action: 'close',
        title: '❌ Fechar',
        icon: '/icon-close.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================
// AÇÃO AO CLICAR NA NOTIFICAÇÃO
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard/brain';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((client) => {
              if ('navigate' in client) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});