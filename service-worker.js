                        importScripts("/assets/js/workbox-v3.6.2/workbox-sw.js");
            workbox.setConfig({modulePathPrefix: "/assets/js/workbox-v3.6.2"});

            self.__precacheManifest = [{"url":"/assets/js/collectives.min.js","revision":"939918cd847e4a6fd2842db465c3cc4e"},{"url":"/assets/js/glsl-canvas.min.js","revision":"029b8e76557372b169ecf6c04fc327e3"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/imagesloaded.pkgd.min.js","revision":"e2c1a80b99251b7b94726b41312fb160"},{"url":"/assets/js/index.min.js","revision":"5a6e69e509277b7df6fc874ca6b6f3cc"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/prism.min.js","revision":"c9e8dad2751189d09b90a4a81957f6da"},{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/TweenMax.min.js","revision":"4b0d7645edfb6f68c4aa331835960f86"},{"url":"/assets/css/app.min.css","revision":"08802b971ef39ab3661fe1b48d9ea55b"},{"url":"/assets/css/collectives.min.css","revision":"430607535d425954111ca81d12beba78"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/post.min.css","revision":"ff43276965b4f02c78f5736cbaa726f1"},{"url":"/assets/css/prism.css","revision":"0e08edd4d4f9739c7d8375ef43b467f4"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"23777b4794e4a3c75474c13ce8db11fb"},{"url":"/coding/2019/02/03/%E5%8F%8D%E8%B5%B0%E6%A0%B7%E6%8A%80%E6%9C%AF-%E5%9B%9B.html","revision":"ed55e7ee062a821030c4b4aa2de9d49c"},{"url":"/coding/2019/02/02/%E5%8F%8D%E8%B5%B0%E6%A0%B7%E6%8A%80%E6%9C%AF-%E4%B8%89.html","revision":"5acdbfe0bbf4a9544a384664df4c695c"},{"url":"/coding/2019/02/01/%E5%8F%8D%E8%B5%B0%E6%A0%B7%E6%8A%80%E6%9C%AF-%E4%BA%8C.html","revision":"b45695e5168ab6dab7855d5bba0f8f07"}];
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

