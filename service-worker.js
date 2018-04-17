                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"562de2759ed6cccb9e9ab9b464726343"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/css/post.min.css","revision":"08c1277ca98447bbb12509437697c0c6"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/app.min.css","revision":"b770dcccae5c17ba25a8b155903533b5"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"5393761e030012cd045b38639aa4527f"},{"url":"/coding/2018/04/10/%E8%BF%9B%E5%85%A53D%E4%B8%96%E7%95%8C.html","revision":"0f74cc59b4f4e9de25f2fc3bbb610c12"},{"url":"/coding/2018/04/05/Shader-%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86.html","revision":"52f747de9a9b075736ace02fb8f9d907"},{"url":"/coding/2018/03/26/%E5%AD%97%E4%BD%93%E5%8A%A0%E8%BD%BD%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5-%E4%BA%8C.html","revision":"393bb7b9a456ae4a8a5f7818dbf30aeb"}]);
                            workboxSW.router.registerRoute(/assets\/(img|icons)/,
                    workboxSW.strategies.cacheFirst());

                workboxSW.router.registerRoute(/^https?:\/\/cdn.staticfile.org/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/at.alicdn.com/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/cloud.netlifyusercontent.com/,
                    workboxSW.strategies.staleWhileRevalidate());

