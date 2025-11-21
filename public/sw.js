// Service Worker Focado em Push Notifications
// Versão Limpa (Sem erros de ESLint)

self.addEventListener('install', () => {
  // Força o SW a se ativar imediatamente, sem esperar o antigo fechar
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Assume o controle de todas as abas abertas imediatamente
  event.waitUntil(clients.claim());
});

// ========================================================
// 🔔 CÓDIGO DE NOTIFICAÇÃO PUSH
// ========================================================

// 1. Ouvir quando o Push chega do servidor
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event sem dados');
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png', // Certifique-se que existe na pasta public
      badge: data.badge || '/badge-72x72.png', // Certifique-se que existe na pasta public
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        postId: data.postId
      },
      actions: [
        {
          action: 'open',
          title: 'Ver Post'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error('Erro ao processar notificação push:', err);
  }
});

// 2. Ouvir o clique na notificação
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Fecha a notificação

  // Abre o link no navegador
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Se já tiver uma aba aberta com o link, foca nela
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});