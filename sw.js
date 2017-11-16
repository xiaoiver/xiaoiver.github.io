importScripts('workbox-sw.prod.v2.1.0.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "about/index.html",
    "revision": "1c387d6db0271a6662c4df79ce4545e9"
  },
  {
    "url": "coding/2017/06/09/以用户为中心的性能指标.html",
    "revision": "5c73f3582e1096379bf6829fd9f4d944"
  },
  {
    "url": "coding/2017/07/14/写一个支持svg的loader.html",
    "revision": "5173b6745e2d60dffab688e15b92c2aa"
  },
  {
    "url": "coding/2017/07/15/基于vue和webpack的skeleton插件.html",
    "revision": "8badf4b13462c1b0d50648c0f3c17d52"
  },
  {
    "url": "coding/2017/07/16/使用ava和travis-ci.html",
    "revision": "be0789d520ef83b8236e3111b7f18f15"
  },
  {
    "url": "coding/2017/07/17/为npm包提供多入口.html",
    "revision": "11fec62623e9221e864d2f442f565d0a"
  },
  {
    "url": "coding/2017/07/22/在GithubPages中使用第三方插件.html",
    "revision": "1acb89dc04325fd620f4e9975069886b"
  },
  {
    "url": "coding/2017/07/23/无用的keywords.html",
    "revision": "cd948b4ed40b154511220c90cddec742"
  },
  {
    "url": "coding/2017/07/30/为vue项目添加骨架屏.html",
    "revision": "c688f20774909f11905fc3e083810a16"
  },
  {
    "url": "coding/2017/08/03/浏览器的恢复滚动行为.html",
    "revision": "c271d9f1a43c3bdb99456a8ec2b80007"
  },
  {
    "url": "coding/2017/08/10/在jekyll中使用代码高亮.html",
    "revision": "83517c5784ada73718a6430bdc759dfd"
  },
  {
    "url": "coding/2017/08/20/判断元素是否在视口内.html",
    "revision": "a42f1f7e13c10f601f15cc8d20bea32b"
  },
  {
    "url": "coding/2017/09/16/消息队列.html",
    "revision": "7070083bc815c5d4464e0eea8507de55"
  },
  {
    "url": "coding/2017/09/29/Webpack-中的-HMR.html",
    "revision": "00f07cb1a90f978bcb4f426738fdce17"
  },
  {
    "url": "coding/2017/10/06/Webpack代码分割.html",
    "revision": "4a7dddf1d262d0c436e22d7cf9c3fd69"
  },
  {
    "url": "coding/2017/10/15/code+cartoon.html",
    "revision": "76e43b84c392e61201af22c91e97fcb8"
  },
  {
    "url": "coding/2017/10/24/SSR-中的离线可用-一.html",
    "revision": "70643a66c54a82c9a2fd0969c391c8fc"
  },
  {
    "url": "coding/2017/10/28/SSR-中的离线可用-二.html",
    "revision": "3dbb7d9383dca94609c97a31c5f42e38"
  },
  {
    "url": "coding/2017/11/09/在Jekyll中使用离线缓存.html",
    "revision": "f6e15b5138cb646517cbe94216e904ec"
  },
  {
    "url": "coding/2017/11/12/SSR-中的离线可用-三.html",
    "revision": "d77c4043dc8dc3a2fd07f4fd7993d4df"
  },
  {
    "url": "css/font-awesome.min.css",
    "revision": "92a640056a77cfd8a109d9441777bce0"
  },
  {
    "url": "css/prism.css",
    "revision": "9cd088d39d160300f84f9d55b65c7022"
  },
  {
    "url": "css/secret.css",
    "revision": "0f452608eda517630ba1992a2996cedb"
  },
  {
    "url": "css/skel.css",
    "revision": "135896e155660a7d07220703047d303a"
  },
  {
    "url": "css/style-large.css",
    "revision": "49258ee76df98c710aae05c36a72f15e"
  },
  {
    "url": "css/style-medium.css",
    "revision": "43e453e62e9ceaa52b67eb25e6cd926b"
  },
  {
    "url": "css/style-small.css",
    "revision": "9f35418e08f50cb132f17ed0c3272f8b"
  },
  {
    "url": "css/style-xlarge.css",
    "revision": "0971ccb84f81f370184fa370d19138b6"
  },
  {
    "url": "css/style-xsmall.css",
    "revision": "a9751d25e71a2be5b8b83ea4dc5f34cb"
  },
  {
    "url": "css/style.css",
    "revision": "7382c87fc7c5fcd2effeeb64dad1cfbf"
  },
  {
    "url": "index.html",
    "revision": "c7a43046b91aa32c6846b5ea6b7f9815"
  },
  {
    "url": "js/broadcast-channel-polyfill.js",
    "revision": "0521ccb9e17fb9474aa87008dc457bdb"
  },
  {
    "url": "js/Imager.min.js",
    "revision": "2312fa2358b9a93688ee61921e6edc68"
  },
  {
    "url": "js/init.min.js",
    "revision": "669e3e024cb20218f0b2774591c84804"
  },
  {
    "url": "js/jquery.min.js",
    "revision": "8101d596b2b8fa35fe3a634ea342d7c3"
  },
  {
    "url": "js/jquery.scrolly.min.js",
    "revision": "c586b89860c31f401eb6d6227804480b"
  },
  {
    "url": "js/jquery.scrollzer.min.js",
    "revision": "11e825a24dc76f5b1441604763ec7bb3"
  },
  {
    "url": "js/prism.min.js",
    "revision": "7e4b960f8db93b6f0335dcb3c04d364a"
  },
  {
    "url": "js/skel-layers.min.js",
    "revision": "20d5f2a41f81bc497603e8d65539ec53"
  },
  {
    "url": "js/skel.min.js",
    "revision": "b41e646e2868752bfb47743f65f9d127"
  },
  {
    "url": "js/workbox-sw.prod.v2.1.1.js",
    "revision": "5c296a6ea8f8cfc1e5446df33b25eda7"
  },
  {
    "url": "manifest.json",
    "revision": "9d074d94fc4330af7981af2975fafc18"
  },
  {
    "url": "movie/2017/07/01/近期看的剧.html",
    "revision": "280f204e07038812d01f63f12db68f3d"
  },
  {
    "url": "movie/2017/08/05/垃圾围城.html",
    "revision": "5a1a503c0f93deb35d41798c1ec95cb6"
  },
  {
    "url": "movie/2017/10/03/火车和出租车.html",
    "revision": "af7787402875fa28fbee893f72a1a284"
  },
  {
    "url": "music/2017/06/03/最近听的说唱.html",
    "revision": "0dec182d2a384426b25ab54e2edc7b27"
  },
  {
    "url": "music/2017/10/05/简单生活节.html",
    "revision": "349dd6dece34b30aba87b2dd1fc653da"
  },
  {
    "url": "page2/index.html",
    "revision": "94e4dfab709e2cb2f6517d15dc07bc68"
  },
  {
    "url": "page3/index.html",
    "revision": "fdf2af49d5b1ab61190e5226177dfc50"
  },
  {
    "url": "page4/index.html",
    "revision": "db1f374820c2c593dd5251d4d00a87ad"
  },
  {
    "url": "page5/index.html",
    "revision": "3f65c4a763dad4ca9a15895007f7e882"
  },
  {
    "url": "sw-register.js",
    "revision": "b428740187352ca842278b68f0aedcde"
  },
  {
    "url": "tags.html",
    "revision": "c6d0e1032b63bd8f32e311f2d5b39045"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);
