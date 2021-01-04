import { musicBox }              from "./init";
import * as spotify              from "./requests";
import { spotifyError }          from "./errorHandling";
import * as utils                from "../utils/playerUtils";
import { initSpotifyPlayer,
        playerIsReady }          from "./playerListeners";
import { getElementDetails }     from "./playlists/elementDetails";
import { defaultPlaylist }       from "./playlists/defaultPlaylist";


export var player = undefined,
song              = undefined;

export var userDetails   = {};
// *** Spotify Player *** //
export function playerIsBusy() {
    if (playerIsReady && utils.songIsSelected) {
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
            $('#playlist-box').removeClass('unavailable');
            utils.updateStatusText(`Logged in as ${userDetails.display_name}`);
            setTimeout(() => {
                firstSongSelection();
            }, 1000);
        })
}

var firstTry = true;
function firstSongSelection() {
    spotify.getPlaylistData(defaultPlaylist())
        .done((res) => {
            song =utils.songSelection(res);
            $(musicBox).addClass('loaded');
            utils.updatePlaylistBox( getElementDetails(res) );
            utils.songSelected(true);
            spotifyError.removeLoader();
            utils.updatePlaceholderText('Ready to<br>play!');
        })
        .catch(() => {
            if (firstTry) {
               firstTry = false;
               localStorage.removeItem('defaultPlaylist');
               firstSongSelection();
           }
        })
}


