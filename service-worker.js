workbox.core.setCacheNameDetails({
    prefix: 'xiaop-blog',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime-cache'
});

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerRoute(
    /\.html$/,
    workbox.strategies.networkFirst()
);

workbox.routing.registerRoute(
    /assets\/(img|icons)/,
    workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
    /^https?:\/\/cloud.netlifyusercontent.com/,
    workbox.strategies.staleWhileRevalidate()
);

workbox.routing.registerRoute(
    /^https?:\/\/cdn.staticfile.org/,
    workbox.strategies.staleWhileRevalidate()
);

workbox.routing.registerRoute(
    /^https?:\/\/at.alicdn.com/,
    workbox.strategies.staleWhileRevalidate()
);
