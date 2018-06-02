                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/prism.min.js","revision":"7e4b960f8db93b6f0335dcb3c04d364a"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"562de2759ed6cccb9e9ab9b464726343"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/css/post.min.css","revision":"3ea9c43dbcbaf151a3d2d50a32d37130"},{"url":"/assets/css/prism.css","revision":"1f88a6a80021587004b0cd765184ebe8"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/app.min.css","revision":"08802b971ef39ab3661fe1b48d9ea55b"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"aa04b0f99baef35293d6531d9a54ef0b"},{"url":"/coding/2018/05/20/%E5%9C%A8-iOS-%E4%B8%8B%E4%BD%BF%E7%94%A8-iframe-%E7%9A%84%E7%A7%8D%E7%A7%8D%E9%97%AE%E9%A2%98.html","revision":"1d922da6a943e7c997625b36cad0e875"},{"url":"/coding/2018/05/14/%E7%BC%96%E8%AF%91-Node.js-%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6.html","revision":"e6b7ac61a4b10e5265d4e1850a73b654"},{"url":"/coding/2018/05/12/Babel-%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91.html","revision":"996075c2c48d1527d3711beb2747f243"}]);
                            workboxSW.router.registerRoute(/assets\/(img|icons)/,
                    workboxSW.strategies.cacheFirst());

                workboxSW.router.registerRoute(/^https?:\/\/cdn.staticfile.org/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/at.alicdn.com/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/cloud.netlifyusercontent.com/,
                    workboxSW.strategies.staleWhileRevalidate());

