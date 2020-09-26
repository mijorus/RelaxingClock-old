self.addEventListener('install', event => {
    /* Nothing to see here */
}, error => {
    console.error(`Service Worker installation failed: ${error}`);
});

self.addEventListener('fetch', function (event) {
    /* Nothing to see here */
});