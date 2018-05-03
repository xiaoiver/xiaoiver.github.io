                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"562de2759ed6cccb9e9ab9b464726343"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/css/app.min.css","revision":"95dad9f008760a0b1798a0143d21e98d"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/post.min.css","revision":"3ea9c43dbcbaf151a3d2d50a32d37130"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"e4ceb266e41c67878b37f2b0680057e7"},{"url":"/coding/2018/05/01/Vue-+-Custom-Elements.html","revision":"92522c90f74cd1c7f0b8df2ede8cddad"},{"url":"/coding/2018/04/30/Vue-%E6%B8%B2%E6%9F%93%E6%9C%BA%E5%88%B6-%E4%B8%89.html","revision":"4668f97b5c0e6985c360f92a2cc421f8"},{"url":"/coding/2018/04/29/Vue-%E6%B8%B2%E6%9F%93%E6%9C%BA%E5%88%B6-%E4%BA%8C.html","revision":"3955c9bb0ff81fb590eb481591d3e769"}]);
                            workboxSW.router.registerRoute(/assets\/(img|icons)/,
                    workboxSW.strategies.cacheFirst());

                workboxSW.router.registerRoute(/^https?:\/\/cdn.staticfile.org/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/at.alicdn.com/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/cloud.netlifyusercontent.com/,
                    workboxSW.strategies.staleWhileRevalidate());

