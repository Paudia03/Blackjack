// public/sw.js

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

async function doLogout() {
  try {
    await fetch('/api/blackjack/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.error('SW logout failed:', err);
    throw err;
  }
}

self.addEventListener('sync', event => {
  if (event.tag === 'logoutSync') {
    event.waitUntil(doLogout());
  }
});
