import { handleHeartButton, 
        updateStatusText }        from '../../utils/js/playerUtils';
import { spotifyError }           from "../spotify/spotifyErrorHandling";
import { clientId,    
        redirectURI }             from '../../utils/js/generateSpotifyUrl';
import { playbackIcon,
        deviceID }                from "./spotifyPlayerListeners";

export var playbackStarted = false;

// *** Ajax **
var requestHeader    = undefined;
const spotifyBaseURL = 'https://api.spotify.com/v1'

export const spotify = {
    requestToken: function() {
        $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'authorization_code',
                code: localStorage.code,
                redirect_uri: redirectURI,
                code_verifier: localStorage.verifier
            }
        })
            .done(function (response) {
                localStorage.removeItem('code');
                localStorage.removeItem('verifier');
                saveLoginResponse(response);
            })
            .fail(function (error) {
                spotifyError.logError("Cannot get token from Spotify", error);
            })
    },

    refreshToken: function() {
        return $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'refresh_token',
                refresh_token: localStorage.refreshToken
            },
        })
            .done(function (response) {
                console.warn(`Token refreshed`);
                localStorage.removeItem('code');
                saveLoginResponse(response);
            })

            .fail(function (error) {
                switch (error.status) {
                    case 400:
                        spotifyError.throwTokenError();
                    break;
                
                    default:
                        spotifyError.throwGenericError();
                        spotifyError.logError("Can't refresh token from Spotify", error);
                    break;
                }

            })
    },

    findDevices: function() {
        return $.ajax({
            method: 'GET',
            url: spotifyBaseURL + '/player/devices',
            headers: requestHeader,
        })
    },

    getUserDetails: function() {
            return $.ajax({
                type: "GET",
                url: spotifyBaseURL + '/me', 
                headers: requestHeader,
            })
                .fail(function(error) {
                    spotifyError.logError('CANNOT GET YOUR USERNAME:', error);
                    updateStatusText(`Cannot get your your profile infos :(`);
                    spotifyError.throwGenericError();
                })
    },

    getPlaylistData: function(playlistURL) {
        return $.ajax({
            type: "GET",
            url: spotifyBaseURL + `/playlists/${playlistURL}`,
            headers: requestHeader
        })
            .fail(function(error) {
                spotifyError.logError('CANNOT SELECT A SONG TO PLAY:', error);
            });
    },
    
    play: function(device_id, song) {
        console.log(`I am playing on: [Device id:${device_id}]`);
        $.ajax({
            type: "PUT",
            headers: requestHeader,
            url: spotifyBaseURL + '/me/player/play?device_id=' + device_id,
            data: JSON.stringify(song)
        })
            .done(function() {
                console.log('I AM PLAYING!');
                playbackStarted = true;
                $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
                setTimeout(function() {
                    spotify.shuffle(true);
                }, 2000);
            })
            .fail(function(error) {
                spotifyError.logError('PLAYBACK ERROR!', error);
                switch (error.status) {
                    case 500 || 502 || 503:
                        $(spotifyPlaceholder).text('Server Error :(');
                    break;

                    case 401:
                        if (error.responseJSON.error.message === 'The access token expired') {
                            spotify.refreshToken()
                                .then(() => {
                                   spotify.play();
                                })
                        }
                    break;
                
                    case 403:
                        if (error.reason === 'PREMIUM_REQUIRED') {
                            spotifyError.throwPremiumError();
                        } else {
                            spotifyError.throwGenericError();
                        }
                    break;

                    default:
                        spotifyError.throwGenericError();
                    break;
                }
            })
    },
    
    shuffle: function(state) {
        $.ajax({
            type: "PUT",
            headers: requestHeader,
            url: spotifyBaseURL + `/me/player/shuffle?state=${state}&device_id=${deviceID}`,
        })
            .done(function() {
                console.log('SHUFFLE IS ENABLED!');
            })
            .fail(function(error) {
                spotifyError.logError('ERROR WHILE ENABLING SHUFFLE MODE:', error, false);
            })
    },

    // The changeState parameter specifies if we have 
    // to display only the changes on screen or we also 
    // need to add the current song to the library
    isLiked: function(song, changeState) {
        $.ajax({
            type: "GET",
            headers: requestHeader,
            url: spotifyBaseURL + `/me/tracks/contains?ids=${song}`,
        })
            .done(function(response) {
                if (response[0]) {
                    console.log('This song is in your library');
                    (changeState) 
                        ? spotify.likeSong(song, false) 
                        : handleHeartButton(true);
                } else {
                    console.log('This song is NOT in your library');
                    (changeState) 
                        ? spotify.likeSong(song, true) 
                        : handleHeartButton(false);
                }
            })
            .fail(function(error) {
                spotifyError.logError('CANNOT CHECK IF THIS SONG IS ALREADY IN YOUR LIBRARY:', error)
            })
    },

    likeSong: function(song, toLike = true) {
        $.ajax({
            type: (toLike) ? "PUT" : "DELETE", 
            headers: requestHeader,
            url: spotifyBaseURL + `/me/tracks?ids=${song}`,
        })
            .done(function () {
                if (toLike) {
                    console.log('ADDED TO FAV!');
                    handleHeartButton(true);
                } else {
                    console.log('REMOVED FROM FAV!');
                    handleHeartButton(false);
                }
            })
            .fail(function (error) {
                (toLike)
                    ? spotifyError.logError('CANNOT ADD TO FAV:', error, false)
                    : spotifyError.logError('CANNOT REMOVE FROM FAV:', error, false);
            })
    },
}

function saveLoginResponse(response) {
    logged = true;
    console.log(`Saving data...`);

    sessionStorage.setItem('accessToken', response.access_token);
    requestHeader = { 'Authorization': `Bearer ${sessionStorage.accessToken}` };
    localStorage.setItem('refreshToken', response.refresh_token);
    document.dispatchEvent(new Event('spotifyLoginCompleted'));
}

