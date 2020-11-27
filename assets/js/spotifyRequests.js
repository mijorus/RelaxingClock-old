// *** Ajax ***//
var spotify = {
    requestHeader: undefined,

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

    refreshToken: function(play = false) {
        $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'refresh_token',
                refresh_token: localStorage.refreshToken
            },
            success: function (response) {
                console.warn(`Token refreshed`);

                localStorage.removeItem('code');
                saveLoginResponse(response);
                if (!premium) spotify.getUserDetails();
                if (play) spotify.play();
            },

            error: function (error) {
                switch (error.status) {
                    case 400:
                        spotify.throwTokenError();
                    break;
                
                    default:
                        spotify.throwGenericError();
                        spotify.logError("Can't refresh token from Spotify", error);
                    break;
                }

            }
        });
    },

    findDevices: function() {
        return $.ajax({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: spotify.requestHeader,
        })
    },

    getUserDetails: function() {
        setTimeout(() => $.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/me", 
            headers: spotify.requestHeader,
            success: function(response) {
                if (response.product === 'premium') {
                    premium = true;
                    setTimeout(() => spotify.selectSong(), 1000);
                    updateStatusText(`Logged in as ${response.id}`)
                    $('#autoplay-box').removeClass('unavailable');
                } else {
                    spotify.throwPremiumError(response.id);
                }
            },
            error: function(error) {
                spotify.logError('CANNOT GET YOUR USERNAME:', error);
                updateStatusText(`Can't get your username, are you on PC?`);
                spotify.throwGenericError();
            }
        }), 1000);
    },

    selectSong: function() {
        const playlistURL = '4ZTZhFPPyRzpfHZsWEXAW9';
        $.ajax({
            type: "GET",
            url: `https://api.spotify.com/v1/playlists/${playlistURL}`,
            headers: spotify.requestHeader,
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
                    updatePlaceholderText('Music will<br>start soon...');
                    setTimeout(function() {
                        if (paused) {
                            spotify.removeLoader();
                            spotify.play(deviceID, randomSong);
                        }
                    }, wait);
                } else if (localStorage.autoplay === 'false') {
                    spotify.removeLoader(); 
                    updatePlaceholderText('Ready to<br>play!');
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
            headers: spotify.requestHeader,
            url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
            data: JSON.stringify(song),
            success: (function() {
                console.log('I AM PLAYING!');
                playbackStarted = true;
                $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
                setTimeout(function() {
                    spotify.shuffle(true);
                }, 2000);

            }),
            error: (function(error) {
                spotify.logError('PLAYBACK ERROR!', error);
                switch (error.status) {
                    case 500:
                    case 502:
                    case 503:
                        $(spotifyPlaceholder).text('Server Error :(');
                    break;

                    case 401:
                        if (error.responseJSON.error.message === 'The access token expired') {
                            spotify.refreshToken(true);
                            //spotify.throwGenericError('It has been a long <br>time, please <a href="${redirectURI}">Reload</a>')
                        }
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
            })
        });
    },
    
    shuffle: function(state) {
        $.ajax({
            type: "PUT",
            headers: spotify.requestHeader,
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
            type: "GET",
            headers: spotify.requestHeader,
            url: `https://api.spotify.com/v1/me/tracks/contains?ids=${song}`,
            success: function(response) {
                if (response[0]) {
                    console.log('This song is in your library');
                    /*If we only have to change the color of the heart, it calls the func
                    directly, otherwise will execute an ajax request*/
                    (changeState) ? spotify.likeSong(currentTrackId, false) : handleHeartButton(true);
                } else {
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
            headers: spotify.requestHeader,
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

    throwTokenError: function () {
        this.removeLoader();
        updateStatusText(`Sorry, but you need to login again`);
        updatePlaceholderText(
            `Please <button id="toker-err-msg" class="transp-btn">login</button> again`, 
            true);
        $('#toker-err-msg').on('click', async function (event) {
            event.preventDefault();
            event.stopPropagation();

            logout(false);
            url = await generateUrl();
            window.location.replace(url);
        });
    },

    //Logs an error to the console
    logError: function(message, error, throwError = true) {
        console.error(`${message}`);
        console.error(error);
        if (throwError) this.throwGenericError();
    },

    throwGenericError: function(message = 'default') {
        player.disconnect();
        this.removeLoader();
        $(musicBox).addClass('error');
        
        if (message === 'default') {
            updatePlaceholderText(
                `Something went<br>wrong :( <a href="${redirectURI}">Try again</a>`, true);
        } else {
            updatePlaceholderText(message, true);
        }
    },

    throwPremiumError: function (username) {
        this.removeLoader();
        localStorage.setItem('premium', 'false');
        updateStatusText(`Sorry ${username}, but you need a premium account`);
        updatePlaceholderText(`Sorry, you must be <br>a premium user :(`, true);
    },

    removeLoader: function(remove = true) {
        if (remove) {
            $(playbackIcon).removeClass('hide');
            handleLoader($('#spotify-loader'), false, null);
        } else {
            $(playbackIcon).addClass('hide');
            handleLoader($('#spotify-loader'), true, null);
        }
    }
}

function saveLoginResponse(response) {
    logged = true;
    console.log(`Saving data...`);

    sessionStorage.setItem('accessToken', response.access_token);
    spotify.requestHeader = { 'Authorization': `Bearer ${sessionStorage.accessToken}` };
    localStorage.setItem('refreshToken', response.refresh_token);

    const loginCompleted = new Event('loginCompleted');
    document.dispatchEvent(loginCompleted);
}