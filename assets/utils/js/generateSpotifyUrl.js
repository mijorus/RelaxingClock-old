import * as siteParams from '@params';

export const clientId = siteParams.client_id,
redirectURI           = siteParams.base_url;

const scopes          = 'user-read-email,user-read-private,user-read-playback-state,user-modify-playback-state,user-read-currently-playing,user-library-modify,user-library-read,streaming,playlist-read-collaborative';

export async function generateUrl() {
  state = generateRandomString();
  localStorage.setItem('state', state);

  verifier = generateRandomString();
  localStorage.setItem('verifier', verifier);

  challenge = await generateChallenge(verifier);
  localStorage.setItem('state', state);

  spotifyURL  = 'https://accounts.spotify.com/authorize?&client_id=' + encodeURIComponent(clientId);
  spotifyURL += '&response_type=code';
  spotifyURL += '&redirect_uri=' + encodeURIComponent(redirectURI);
  spotifyURL += '&code_challenge_method=S256';
  spotifyURL += '&code_challenge=' + encodeURIComponent(challenge);
  spotifyURL += '&state=' + encodeURIComponent(state);
  spotifyURL += '&scope=' + encodeURIComponent(scopes);

  return spotifyURL;
}

function generateRandomString() {
  if (window.crypto) {
    var array = new Uint32Array(30);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }
}

function base64urlencode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// function escaper(str) {
//   return str.replace(/\+/g, '-')
//   .replace(/\//g, '_')
//   .replace(/=/g, '')
// }

function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

async function generateChallenge(verifier) {
  const hashedVerifier = await sha256(verifier);
  return base64urlencode(hashedVerifier);
}