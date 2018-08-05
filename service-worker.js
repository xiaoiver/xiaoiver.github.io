                        importScripts("/assets/js/workbox-v3.3.1/workbox-sw.js");
            workbox.setConfig({modulePathPrefix: "/assets/js/workbox-v3.3.1"});

            self.__precacheManifest = [{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/collectives.min.js","revision":"939918cd847e4a6fd2842db465c3cc4e"},{"url":"/assets/js/prism.min.js","revision":"7855d733528cfc527d7f90706ed7b63b"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/imagesloaded.pkgd.min.js","revision":"e2c1a80b99251b7b94726b41312fb160"},{"url":"/assets/js/TweenMax.min.js","revision":"4b0d7645edfb6f68c4aa331835960f86"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"5a6e69e509277b7df6fc874ca6b6f3cc"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/css/post.min.css","revision":"3ea9c43dbcbaf151a3d2d50a32d37130"},{"url":"/assets/css/collectives.min.css","revision":"430607535d425954111ca81d12beba78"},{"url":"/assets/css/prism.css","revision":"1afa9feec7e1485af173fbf24b1c27b4"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/app.min.css","revision":"08802b971ef39ab3661fe1b48d9ea55b"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"df0a935b9d6996ecadf3e4378f61a2a0"},{"url":"/coding/2018/08/01/%E5%99%AA%E5%A3%B0%E7%9A%84%E8%89%BA%E6%9C%AF.html","revision":"924ada8cc645904c928b9289d65110cc"},{"url":"/coding/2018/07/20/%E7%BB%98%E5%88%B6-Pattern.html","revision":"bd96786eba2d29e355aaa0e487aa9186"},{"url":"/coding/2018/07/01/WebGL-%E4%B8%AD%E7%9A%84%E6%B5%8B%E8%AF%95.html","revision":"be24d2b5528676907c6decc7f08a1d86"}];
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

