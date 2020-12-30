self.addEventListener('install', event => {
    const cacheName = 'relaxingclock-v2';

    // Hugo's code injection
    const cacheFiles = [
        '{{ delimit (.) "', '" }}',
        {{ range(readDir "./static/icons") }}'/icons/{{ .Name }}', {{ end }}
        {{ range(readDir "./static/img") }}'/img/{{ .Name }}', {{ end }}
        {{ range(readDir "./static/media") }}'/media/{{ .Name }}', {{ end }}
        {{ range(readDir "./static/font") }}'/font/{{ .Name }}', {{ end }}
        {{ range(readDir "./static/font/fa-webfonts") }}'/font/fa-webfonts/{{ .Name }}', {{ end }}
    ];
}, error => {
    console.error(`Service Worker installation failed: ${error}`);
});

self.addEventListener('fetch', function (event) {
    /* Nothing to see here */
});