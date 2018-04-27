                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"562de2759ed6cccb9e9ab9b464726343"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/css/post.min.css","revision":"d4d8feff5bea43efed406c18708a0593"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/app.min.css","revision":"9c724bcdb2941e74636deb331109cd64"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"ed74664193078a34fcd67f56b7ef7b85"},{"url":"/coding/2018/04/22/OpenCV-%E5%9B%BE%E5%83%8F%E8%AF%86%E5%88%AB.html","revision":"87343e33a2f4c8934793db6437fd0b79"},{"url":"/coding/2018/04/21/Polymer-%E4%B8%AD%E7%9A%84%E8%B7%AF%E7%94%B1%E8%AE%BE%E8%AE%A1.html","revision":"105da3383690cca799b9cf1967ea0011"},{"url":"/coding/2018/04/21/Polymer-%E4%B8%AD%E7%9A%84-PRPL-%E6%A8%A1%E5%BC%8F.html","revision":"9e8f6774891eef1341a5cdee6181aefd"}]);
                            workboxSW.router.registerRoute(/assets\/(img|icons)/,
                    workboxSW.strategies.cacheFirst());

                workboxSW.router.registerRoute(/^https?:\/\/cdn.staticfile.org/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/at.alicdn.com/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/cloud.netlifyusercontent.com/,
                    workboxSW.strategies.staleWhileRevalidate());

