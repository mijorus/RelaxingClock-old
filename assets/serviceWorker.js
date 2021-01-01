const cacheName = 'relaxingclock-{{ now.Unix }}';

// Hugo's code injection
const cacheFiles = [
    '{{ delimit (.) "', '" }}',
    '/cookie/index.html',
    '/credits/index.html',
    '/faq/index.html',
    '/',
    'index.html',
    {{ range(readDir "./static/icons") }}'/icons/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/img") }} '/img/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/media") }} '/media/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/font") }} '/font/{{ .Name }}', {{ end }}
    {{ range(readDir "./static/font/fa-webfonts") }} '/font/fa-webfonts/{{ .Name }}', {{ end }}
];

self.addEventListener('install', (event) => {
        console.warn('Service Worker Installed');
        event.waitUntil(
            caches.open(cacheName)
                .then((cache) => {
                    return cache.addAll(cacheFiles);
                })
        );
    }, (error) => {
        console.error(`Service Worker installation failed: ${error}`);
    }
);

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((res) => {
                return res || fetch(event.request);
            })
            .catch((err) => {
                console.error(err.statusText)
            })
    );
});