const DEFAULT_URL = '/tasks';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const getPayload = (event) => {
  if (!event.data) {
    return {
      title: 'POMNI',
      body: 'У вас есть новое напоминание.',
      url: DEFAULT_URL,
      tag: 'pomni-reminder',
    };
  }

  try {
    return event.data.json();
  } catch {
    return {
      title: 'POMNI',
      body: event.data.text(),
      url: DEFAULT_URL,
      tag: 'pomni-reminder',
    };
  }
};

const getSafeUrl = (value) => {
  try {
    const url = new URL(value || DEFAULT_URL, self.location.origin);
    return url.origin === self.location.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
};

self.addEventListener('push', (event) => {
  const payload = getPayload(event);
  event.waitUntil(
    self.registration.showNotification(payload.title || 'POMNI', {
      body: payload.body || 'У вас есть новое напоминание.',
      icon: '/images/pomni-icon-192.png',
      badge: '/images/pomni-notification-badge-96.png',
      tag: payload.tag || 'pomni-reminder',
      data: {
        url: getSafeUrl(payload.url),
      },
    }),
  );
});

const openNotificationTarget = async (targetUrl) => {
  const windowClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  const existingClient = windowClients.find(
    (client) => new URL(client.url).origin === self.location.origin,
  );

  if (existingClient) {
    try {
      const navigatedClient = 'navigate' in existingClient
        ? await existingClient.navigate(targetUrl)
        : existingClient;
      return await (navigatedClient || existingClient).focus();
    } catch {
      return clients.openWindow(targetUrl);
    }
  }

  return clients.openWindow(targetUrl);
};

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const safePath = getSafeUrl(event.notification.data?.url);
  const targetUrl = new URL(safePath, self.location.origin).href;

  event.waitUntil(openNotificationTarget(targetUrl));
});
