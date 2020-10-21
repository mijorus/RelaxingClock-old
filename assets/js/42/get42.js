//fetch('/.netlify/functions/42/get42').then((res) => { console.log(res) })
function get42url() {
    const frBaseURL = 'https://api.intra.42.fr/oauth/authorize'
    let state = `42plugin${generateRandomString()}`
    localStorage.setItem('state42', state)

    let url = frBaseURL
    url += '?client_id=78c220293ecfd19a38ca6ce01e1e2f45452148cf98302e5568af77a130714ed8'
    url += '&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F'
    url += '&response_type=code'
    url += `&state=${encodeURIComponent(state)}`
    url += `&scope=${encodeURIComponent('public projects tig forum')}`

    return url
}

if (/^42plugin/.test(params.state) && localStorage.getItem('state42')) {
    const savedState = localStorage.getItem('state42').toString()
    if (savedState === params.state) {
        console.log('Login with 42 Success!')
    } else {
        console.error('Authentication error!')
    }
}