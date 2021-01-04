const cacheName = 'relaxingclock-v{{ site.Params.version }}';

// Hugo's code injection
const cacheFiles = [ 
    '{{ delimit (.) "', '" }}',
    '/cookie/',
    '/credits/',
    '/faq/',
    '/manifest.webmanifest',
    '/',
    {{ range(readDir "./static/icons") }}'/icons/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/img") }} '/img/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/media") }} '/media/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/font/webfonts") }} '/font/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/font/fa-webfonts") }} '/font/fa-webfonts/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/font/linearicons") }} '/font/linearicons/{{ .Name }}', {{ end }}
];

self.addEventListener('install', (event) => {
        console.warn('Installing Service Worker...');
        event.waitUntil(
            caches.open(cacheName)
                .then((cache) => {
                    return cache.addAll(cacheFiles);
                })
                .catch((err) => console.error(err))
        );
    }, (error) => {
        console.error(`Service Worker installation failed: ${error}`);
    }
);

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
            })
    );
});

self.addEventListener('activate', (event) => {
    // Remove old files from cache 
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (cacheName.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});