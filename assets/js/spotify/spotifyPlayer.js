import { musicBox }              from "./playerInit";
import { spotify }               from "./spotifyRequests";
import { spotifyError }          from "./spotifyErrorHandling";
import { updateStatusText,
        songIsSelected,
        songSelection,
        songSelected,
        updatePlaceholderText }  from "../../utils/js/playerUtils";
import { getRandomIntInclusive } from '../../utils/js/utils';
import { initSpotifyPlayer,
        deviceID,
        playerIsReady,
        paused }                 from "./spotifyPlayerListeners";

export const playlistURL = '4ZTZhFPPyRzpfHZsWEXAW9';

export var player = undefined,
song              = undefined;

export var userDetails   = {};
// *** Spotify Player *** //
export function playerIsBusy() {
    if (playerIsReady && songIsSelected) {
        return false
    } else {
        return true
    }
}

export function createNewSpotifyPlayer() {
    player = new Spotify.Player({
        name: 'Relaxing Clocks',
        getOAuthToken: function(callback) {
            //We request a token for the first time
            if (localStorage.code !== undefined) {
                spotify.requestToken();
            }

            else if (localStorage.refreshToken) {
                //We need to request a new token using refreshToken
                spotify.refreshToken();
            }

            $(document).on('spotifyLoginCompleted', function () {
                console.info(`Login Completed!`);
                $(document).off('loginCompleted');
                callback(sessionStorage.accessToken);
            });
        }
    });

    player.connect()
        .then((success) => {
            if (success) {
                initSpotifyPlayer();
            }
        })
}

export function getUserInfo() {
    spotify.getUserDetails()
        .done((res) => {
            userDetails = res;
            [$('#autoplay-box'), $('#playlist-box')].forEach((el) => {
                $(el).removeClass('unavailable');
            });
            updateStatusText(`Logged in as ${userDetails.display_name}`);
            setTimeout(() => {
                firstSongSelection();
            }, 1000);
        })
}

function firstSongSelection() {
    spotify.getPlaylistData(playlistURL)
        .done((res) => {
            song = songSelection(res)
            $(musicBox).addClass('loaded');
            songSelected(true);
            if (localStorage.autoplay === 'true') {
                const wait = getRandomIntInclusive(4000, 7500);
                console.log(`Autoplay is enabled, starting in ${wait / 1000} seconds`);

                updatePlaceholderText('Music will<br>start soon...');
                setTimeout(function() {
                    if (paused) {
                        spotifyError.removeLoader();
                        spotify.play(deviceID, song);
                    }
                }, wait);
            } else if (localStorage.autoplay === 'false') {
                spotifyError.removeLoader();
                updatePlaceholderText('Ready to<br>play!');
            }
        })
}