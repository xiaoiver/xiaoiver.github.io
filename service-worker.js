                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"350c24fe24e0755d87e4c349967cb4a5"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/css/app.min.css","revision":"b770dcccae5c17ba25a8b155903533b5"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/post.min.css","revision":"a6120dedfd7add941cf6f9158c82187f"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"022d02df140afedc42c7fdf8606e5e78"},{"url":"/coding/2018/03/13/%E8%AE%A9%E9%AA%A8%E6%9E%B6%E5%B1%8F%E6%9B%B4%E5%BF%AB%E6%B8%B2%E6%9F%93.html","revision":"03cd1ad6507049fdb854f4abab39facc"},{"url":"/music/2017/12/20/%E6%88%91%E7%9A%84%E6%97%A5%E6%9C%AC%E8%A1%8C.html","revision":"6a7753055001bdaa1d2b9a688b068506"},{"url":"/music/2017/12/11/%E6%88%91%E7%9A%84%E6%97%A5%E6%9C%AC%E8%A1%8C.html","revision":"a9fb622a700e3e3d10a07198863c0354"}]);
                            workboxSW.router.registerRoute(/assets\/img/,
                    workboxSW.strategies.cacheFirst());

