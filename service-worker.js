                            importScripts('/assets/js/workbox-sw.prod.v2.1.1.js');

            const workboxSW = new WorkboxSW({
                cacheId: 'xiaop-blog-cache',
                ignoreUrlParametersMatching: [/^utm_/],
                skipWaiting: true,
                clientsClaim: true
            });
            workboxSW.precache([{"url":"/assets/js/social-share.min.js","revision":"54dcc9d7bf7f775c7b844c02babe93d5"},{"url":"/assets/js/collectives.min.js","revision":"939918cd847e4a6fd2842db465c3cc4e"},{"url":"/assets/js/prism.min.js","revision":"7855d733528cfc527d7f90706ed7b63b"},{"url":"/assets/js/jquery.nav.js","revision":"161fb6357601a77f0b608e0d472c4b2c"},{"url":"/assets/js/imagesloaded.pkgd.min.js","revision":"e2c1a80b99251b7b94726b41312fb160"},{"url":"/assets/js/TweenMax.min.js","revision":"4b0d7645edfb6f68c4aa331835960f86"},{"url":"/assets/js/Imager.min.js","revision":"2312fa2358b9a93688ee61921e6edc68"},{"url":"/assets/js/index.min.js","revision":"5a6e69e509277b7df6fc874ca6b6f3cc"},{"url":"/assets/css/share.min.css","revision":"a5d28161d70468ec2378da676284a34f"},{"url":"/assets/css/post.min.css","revision":"3ea9c43dbcbaf151a3d2d50a32d37130"},{"url":"/assets/css/collectives.min.css","revision":"6b5680c101ad155aeabf32ae8630d733"},{"url":"/assets/css/prism.css","revision":"1afa9feec7e1485af173fbf24b1c27b4"},{"url":"/assets/css/github-markdown.css","revision":"6797a54b2e0026174985ab06ad94326f"},{"url":"/assets/css/app.min.css","revision":"08802b971ef39ab3661fe1b48d9ea55b"},{"url":"/assets/fonts/iconfont.eot","revision":"e83ffaa95463f987abe5db5bbbe303cc"},{"url":"/assets/fonts/iconfont.svg","revision":"eb5d36236b96681900e300ab19c620b6"},{"url":"/assets/fonts/Merriweather-Light.ttf","revision":"ce9dd9123c54a9389f37084bfd780db9"},{"url":"/assets/fonts/iconfont.ttf","revision":"9ac2cc5ae8616eb50c033525dc14a5eb"},{"url":"/assets/fonts/Merriweather-Black.ttf","revision":"c9d1110e70e6caaaef00cb2e0e81f245"},{"url":"/assets/fonts/iconfont.woff","revision":"bf0fc2ec6e2a614635e0ab6e81d059ef"},{"url":"/index.html","revision":"6129d35a7d257b51f2b321826ecd9459"},{"url":"/coding/2018/05/25/%E5%85%89%E7%85%A7%E5%9F%BA%E7%A1%80.html","revision":"8ff6d5b1894028708ef73c3ed0bd45fa"},{"url":"/coding/2018/05/20/%E5%9C%A8-iOS-%E4%B8%8B%E4%BD%BF%E7%94%A8-iframe-%E7%9A%84%E7%A7%8D%E7%A7%8D%E9%97%AE%E9%A2%98.html","revision":"23e7e7c16062f21f5a3c15815a53ea41"},{"url":"/coding/2018/05/14/%E7%BC%96%E8%AF%91-Node.js-%E5%8F%AF%E6%89%A7%E8%A1%8C%E6%96%87%E4%BB%B6.html","revision":"e6b7ac61a4b10e5265d4e1850a73b654"}]);
                            workboxSW.router.registerRoute(/assets\/(img|icons)/,
                    workboxSW.strategies.cacheFirst());

                workboxSW.router.registerRoute(/^https?:\/\/cdn.staticfile.org/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/at.alicdn.com/,
                    workboxSW.strategies.staleWhileRevalidate());

                workboxSW.router.registerRoute(/^https?:\/\/cloud.netlifyusercontent.com/,
                    workboxSW.strategies.staleWhileRevalidate());

