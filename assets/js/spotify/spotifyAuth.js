import { params, spotifyPlaceholder, musicBox } from "./init";
import { compatibility } from "../compatibilityDetector";
import { updateStatusText } from "../../utils/js/playerUtils";
import { createNewSpotifyPlayer, player } from "./spotifyPlayer";

export var logged = false,
accessDenied      = false,
premium           = false;

export function login () {
    if (compatibility.login) {
        if (localStorage.userHasLogged === 'false') {
            if (params.state === undefined) {
                //The user has never logged before to the app
                putURL();
                $(spotifyPlaceholder).html('Login with <br> Spotify');
                updateStatusText('Login with Spotify to listen some relaxing beats');
            } else if (params.state && params.error === undefined) {
                //The user comes from the Spotify's authentication page
                //without errors
                console.log(params);
                if (params.state === localStorage.state) {
                    //The state variables match, the authentication is completed,
                    //the app will reload the page to clean the address bar
                    localStorage.userHasLogged = 'true';
                    localStorage.removeItem('state');
                    localStorage.setItem('code', params.code);
                    window.location.replace(redirectURI);
                } else {
                    //The states don't match, the authentication failed
                    throwAuthError('States do not match');
                }
            } else if (params.error) {
                //Spotify responded with an error during the authentication process
                throwAuthError(params.error);
            }
        } else if (localStorage.userHasLogged === 'true' && compatibility.login) {
            $(musicBox).removeClass('unlogged').addClass('logged');
            window.onSpotifyWebPlaybackSDKReady = () => {
                createNewSpotifyPlayer();
            }
        }
    } else {
        throwUncompatibilityErr();
    }
}

export function logout(redirect = true) {
    if (player) player.disconnect();
    localStorage.userHasLogged = 'false';
    if (sessionStorage.accessToken) sessionStorage.removeItem('accessToken');
    if (sessionStorage.expires_at) sessionStorage.removeItem('expires_at');
    if (localStorage.refreshToken) localStorage.removeItem('refreshToken');
    localStorage.removeItem('verifier');
    localStorage.removeItem('state');
    if (redirect) window.location.replace(redirectURI);
}

function throwAuthError(error) {
    console.error(`Authentication Error, ${error}!`);

    accessDenied = true;
    $(spotifyPlaceholder).html('Authentication<br>Error').addClass('error');
    (error === 'access_denied') ? updateStatusText(`Access denied! :(`)
        : updateStatusText(`Authentication Error :(`);
}

function throwUncompatibilityErr() {
    $(musicBox).addClass('unsupported');
    $('#spotify-status-box').addClass('unavailable');

    if (compatibility.isMobile) {
        updateStatusText(`Connect from your PC to login with Spotify`);
        console.error('Unsupported device: Spotify does not currenty support login from smartphones or tablets');
    } else if (!compatibility.isMobile && !compatibility.urlEncoding) {
        updateStatusText(`Your browser doesn't seem to be compatible :(`);
        console.error('Unsupported device: Base64 encoding is not supported!');
    }
}

async function putURL() {
    const url = await generateUrl();
    $('#spotify-link').attr('href', url);
}