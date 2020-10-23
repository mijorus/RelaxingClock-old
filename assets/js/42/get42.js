//fetch('/.netlify/functions/42/get42').then((res) => { console.log(res) })
function get42url() {
    const frBaseURL = 'https://api.intra.42.fr/oauth/authorize'
    let state = `42plugin${generateRandomString()}`
    localStorage.setItem('stateFr', state)

    let url = frBaseURL
    url += '?client_id=78c220293ecfd19a38ca6ce01e1e2f45452148cf98302e5568af77a130714ed8'
    url += '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F'
    url += '&response_type=code'
    url += `&state=${encodeURIComponent(state)}`
    url += `&scope=${encodeURIComponent('public projects tig forum')}`

    return url
}

if (/^42plugin/.test(params.state) && localStorage.getItem('stateFr')) {
    if (localStorage.stateFr === params.state) {
        console.warn('Login with 42 Success!')
        request42Token()
    } else {
        console.error('Authentication error!')
    }
}

function request42Token() {
    $.ajax({
        method: 'POST',
        url: '/.netlify/functions/42',
        data: JSON.stringify({
            'code': params.code,
            'state': params.state
        }),
        processData: false,
        dataType: "json",
        success: function (res) {
            console.log(res);
            localStorage.setItem('fr_access_token', res.access_token)
            localStorage.setItem('fr_refresh_token', res.refresh_token)
        },
        error: function (err) {
            console.log(err);
        }
    })
}