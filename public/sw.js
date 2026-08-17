self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const tagId = data.tag || data.id || data.title || 'sculpt_notification';
    const options = {
      body: data.body,
      icon: '/assets/logo.png', // Fallback to icon
      badge: '/assets/logo.png',
      tag: tagId,
      renotify: false,
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Sculpt & Shine', options)
    );
  } catch (error) {
    console.error('Push event error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there is already a window open, focus it and redirect
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
