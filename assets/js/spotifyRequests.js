// *** Ajax ***//
var spotify = {
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
            },
            success: function (response) {
                localStorage.removeItem('code');
                localStorage.removeItem('verifier');
                saveLoginResponse(response);
                spotify.getUserDetails();
            },

            error: function (error) {
                spotify.logError("Can't get token from Spotify", error);
            }
        });
    },

    refreshToken: function() {
        $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'refresh_token',
                refresh_token: localStorage.refreshToken
            },
            success: function (response) {
                console.log(`Token refreshed`);

                localStorage.removeItem('code');
                saveLoginResponse(response);
                spotify.getUserDetails();
            },

            error: function (error) {
                spotify.logError("Can't refresh token from Spotify", error);
            }
        });
    },

    getUserDetails: function() {
        $.ajax({
            type: "GET", async: true, cache: false, url: "https://api.spotify.com/v1/me", 
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            success: function (response) {
                if (response.product == 'premium') {
                    premium = true;
                    updateStatusText(`Logged in as ${response.id}`)
                    $('#autoplay-box').removeClass('unavailable');
                } else {
                    spotify.throwPremiumError(response.id);
                }
            },
            error: function(error) {
                spotify.logError('CANNOT GET YOUR USERNAME:', error);
            }
        });
    },

    selectSong: function() {
        const playlistURL = '4ZTZhFPPyRzpfHZsWEXAW9';
        $.ajax({
            type: "GET", async: true, cache: false, url: `https://api.spotify.com/v1/playlists/${playlistURL}`,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            success: function(response) {
                const playlistLength = response.tracks.total;
                randomPosition = getRandomIntInclusive(0, playlistLength);
                $(musicBox).addClass('loaded');
                songIsSelected = true;
                randomSong = {
                    'context_uri' : `spotify:playlist:${playlistURL}`,
                    'offset': {
                        'position' : randomPosition
                    }
                }
                
                if (localStorage.autoplay === 'true') {
                    const wait = getRandomIntInclusive(4000, 7500);
                    console.log(`Autoplay is enabled, starting in ${wait / 1000} seconds`);
                    $(spotifyPlaceholder).html('Music will<br>start soon...');
                    setTimeout(function() {
                        if (paused) {
                            handleLoader($('#spotify-loader'), false, null);
                            $(playbackIcon).removeClass('hide');
                            spotify.play(deviceID, randomSong);
                        }
                    }, wait);
                } else if (localStorage.autoplay === 'false') {
                    $(spotifyPlaceholder).html('Ready to<br>play!');
                    handleLoader($('#spotify-loader'), false, null);
                    $(playbackIcon).removeClass('hide');
                }
                
                console.log(`There are ${response.tracks.total} songs in the playlist, I have selected the #${randomPosition}`);
            },
            error: function(error) {
                spotify.logError('CANNOT SELECT A SONG TO PLAY:', error);
            }
        }); 
    },
    
    play: function(device_id, song) {
        console.log(`I am playing on: [Device id:${device_id}]`);
        $.ajax({
            type: "PUT",
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
            data: JSON.stringify(song),
            success: function() {
                console.log('I AM PLAYING!');
                playbackStarted = true;
                $(playbackIcon).removeClass('fa-play');
                $(playbackIcon).addClass('fa-pause');
                setTimeout(function() {
                    spotify.shuffle(true);
                }, 2000);

            },
            error: function(error) {
                spotify.logError('PLAYBACK ERROR!', error);
                switch (error.state) {
                    case 500:
                    case 502:
                    case 503:
                        $(spotifyPlaceholder).text('Server Error :(');
                    break;
                
                    case 403:
                        if (error.reason === 'PREMIUM_REQUIRED') {
                            spotify.throwPremiumError();
                        } else {
                            spotify.throwGenericError();
                        }
                    break;

                    default:
                        spotify.throwGenericError();
                    break;
                }
            }
        });
    },
    
    shuffle: function(state) {
        $.ajax({
            type: "PUT", async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/player/shuffle?state=${state}&device_id=${deviceID}`,
            success: function() {
                console.log('SHUFFLE IS ENABLED!');
            },
            error: function(error) {
                spotify.logError('ERROR WHILE ENABLING SHUFFLE MODE:', error, false);
            }
        });
    },

    /*The changeState parameter specifies if we have to display only
    the changes on screen or send an ajax requesto to Spotify */
    isLiked: function(song, changeState) {
        $.ajax({
            type: "GET", async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/tracks/contains?ids=${song}`,
            success: function(response) {
                if (response[0]) {
                    favourite = true;
                    console.log('This song is in your library');
                    /*If we only have to change the color of the heart, it calls the func
                    directly, otherwise will execute an ajax request*/
                    (changeState) ? spotify.likeSong(currentTrackId, false) : handleHeartButton(true);
                } else {
                    favourite =  false;
                    console.log('This song is NOT in your library');
                    (changeState) ? spotify.likeSong(currentTrackId, true) : handleHeartButton(false);
                }
            },
            error: function(error) {
                spotify.logError('CANNOT CHECK IF THIS SONG IS ALREADY IN YOUR LIBRARY:', error)
            }
        });
    },

    likeSong: function(song = currentTrackId, toLike = true) {
        $.ajax({
            type: (toLike) ? "PUT" : "DELETE", 
            async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/tracks?ids=${song}`,
            success: function () {
                if (toLike) {
                    console.log('ADDED TO FAV!');
                    handleHeartButton(true);
                } else {
                    console.log('REMOVED FROM FAV!');
                    handleHeartButton(false);
                }
            },
            error: function (error) {
                if (toLike) {
                    spotify.logError('CANNOT ADD TO FAV:', error, false);
                } else {
                    spotify.logError('CANNOT REMOVE FROM FAV:', error, false);
                }
            }
        });
    },

    logError: function(message, error, throwError = true) {
        const err = error.responseJSON.error.message;
        console.error(`${message} ${(err) ? err : null}`);
        if (throwError) this.throwGenericError();
    },

    throwGenericError: function() {
        player.pause();
        $('#spotify-track-info').hide();
        $(spotifyPlaceholder).css('opacity', 1);
        $(spotifyPlaceholder).html(
            `Something went<br>wrong :( <a href="${redirectURI}">Try again</a>`
        );
    },

    throwPremiumError: function (username) {
        localStorage.setItem('premium', 'false');
        updateStatusText(`Sorry ${username}, but you need a premium account`);
        $(spotifyPlaceholder).text(`Sorry, you must be a premium user :(`);
    }
}

function saveLoginResponse(response) {
    logged = true;
    console.log(`Saving data...`);

    const expires_at = moment().unix() + (parseInt(response.expires_in));

    sessionStorage.setItem('expires_at', expires_at);
    sessionStorage.setItem('accessToken', response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);

    const loginCompleted = new Event('loginCompleted');
    document.dispatchEvent(loginCompleted);
}