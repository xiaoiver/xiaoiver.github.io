                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"350c24fe24e0755d87e4c349967cb4a5"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/css/app.min.css","revision":"b770dcccae5c17ba25a8b155903533b5"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/post.min.css","revision":"a6120dedfd7add941cf6f9158c82187f"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"2c3643abcf2e65894f87e19d5f136ec3"},{"url":"/music/2017/12/11/%E6%88%91%E7%9A%84%E6%97%A5%E6%9C%AC%E8%A1%8C.html","revision":"a9fb622a700e3e3d10a07198863c0354"},{"url":"/coding/2017/11/12/SSR-%E4%B8%AD%E7%9A%84%E7%A6%BB%E7%BA%BF%E5%8F%AF%E7%94%A8-%E4%B8%89.html","revision":"39a0802ce72c2cff7a9bb178745d3ec0"},{"url":"/coding/2017/11/09/%E5%9C%A8Jekyll%E4%B8%AD%E4%BD%BF%E7%94%A8%E7%A6%BB%E7%BA%BF%E7%BC%93%E5%AD%98.html","revision":"6e9067eaab0abd95c1e45e88b5b46b43"}]);
                            workboxSW.router.registerRoute(/^api\/xxx/,
                    workboxSW.strategies.cacheOnly());

                workboxSW.router.registerRoute('/api/xxxxx',
                    workboxSW.strategies.cacheOnly());

