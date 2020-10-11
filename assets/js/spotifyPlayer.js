const likeBtn = $('.like-btn'),
playBtn = $('.play-btn'),
playbackIcon = $('#playback-icon');

var deviceID = undefined,
randomSong = undefined,
currentTrackId = undefined,
playerIsReady = false,
songIsSelected = false,
currentTrack = {},
currentStateContext = {},
currentTrackId = undefined,
playbackStarted = false;
//favourite = false;

// *** Spotify Player *** //

if (localStorage.userHasLogged === 'true' && compatibility.login) {
    window.onSpotifyWebPlaybackSDKReady = () => {
        createNewSpotifyPlayer();
    }
}

function createNewSpotifyPlayer() {
    player = new Spotify.Player({
        name: 'Relaxing Clocks',
        getOAuthToken: function (callback) {
            if (localStorage.code !== undefined) {
                //We request a token for the first time
                spotify.requestToken();
            }

            else if (localStorage.refreshToken) {
                //We need to request a new token using the refresh_token
                spotify.refreshToken();
            }

            $(document).on('loginCompleted', function () {
                console.info(`Login Completed!`);
                $(document).off('loginCompleted');
                callback(sessionStorage.accessToken);
            });
        }
    });

    player.connect();
    initSpotifyPlayer();
}

function initSpotifyPlayer() {
    const trackName = $('#track-name'),
    likeBtn = $('.like-btn'),
    artistName = $('#artist-name'),
    spotifyTrackInfo = $('#spotify-track-info'),
    spotifyIcon = $('#spotify-icon'),
    songInfo = $('#song-info'),
    playbackIcon = $('#playback-icon');

    // Error handling
    player.addListener('initialization_error', function ({ message }) {
        console.error(message);
        spotify.throwGenericError();
    });
    player.addListener('playback_error', function ({ message }) {
        console.error(message);
        player.removeListener('playback_error');
        reconnect();
    });

    // Playback status updates
    player.addListener('player_state_changed', function (state) {
        if (state) {
            const thisTrack = state.track_window.current_track;
            currentStateContext = state.context;
            currentTrack = (thisTrack) ? thisTrack : currentTrack;

            if (state.paused) {
                paused = true;
                $(playbackIcon).removeClass('fa-pause');
                $(playbackIcon).addClass('fa-play');
            } else {
                paused = false;
                $(playbackIcon).removeClass('fa-play');
                $(playbackIcon).addClass('fa-pause');
            }

            if (currentTrack.id !== currentTrackId) {
                console.log('Playing a new track...');
                $(spotifyTrackInfo).removeClass('hide');
                $(spotifyPlaceholder).css('opacity', 0);
                if (currentTrack.album.images[1].url) {
                    $(spotifyIcon).addClass('has-cover');
                    $(spotifyIcon).css({
                        'background-image': `url(${currentTrack.album.images[1].url})`
                    });
                }

                currentTrackId = currentTrack.id;
                scrollText.stop($(trackName), $(artistName));

                const spWidth = $(spotifyPlaceholder).width();

                $(trackName).text(currentTrack.name);
                var titleSize = $(trackName).get(0).scrollWidth;
                if (titleSize - 5 > spWidth) {
                    scrollText.play($(trackName).get(0), titleSize, spWidth, 2000);
                }

                var artistsText = '';
                const artists = currentTrack.artists;
                for (var i = 0; i < artists.length; i++) {
                    if (i == (artists.length - 1)) {
                        artistsText += `${artists[i].name}`
                    } else {
                        artistsText += `${artists[i].name}, `
                    }
                }

                $(artistName).text(artistsText);

                var artistNameSize = $(artistName).get(0).scrollWidth;
                if (artistNameSize - 5 > spWidth) {
                    scrollText.play($(artistName).get(0), artistNameSize, spWidth, 4000);
                }

                setTimeout(spotify.isLiked(currentTrackId, false), 250);
                $('#song-info-thumb-placeholder').addClass('hide');
                $('#song-det-title').text(currentTrack.name);
                $('#song-det-artist').text(artistsText);
                $('#song-det-album').text(currentTrack.album.name);
                $('#song-det-durat').text(moment.duration(currentTrack.duration_ms, 'milliseconds').format('mm:ss'));
                $('#song-info-thumb').css({
                    'background-image': `url(${currentTrack.album.images[2].url})`
                });
            }
        }
    });

    // Ready
    player.addListener('ready', function ({ device_id }) {
        playerIsReady = true;
        deviceID = device_id;
        console.log('Ready with Device ID', deviceID);
    });

    // Not Ready
    player.addListener('not_ready', function ({ device_id }) {
        console.log('Device has gone offline', device_id);
    });

    //Listeners
    $(playBtn).on('click', function (event) {
        event.preventDefault(); event.stopPropagation();
        if (!playerIsBusy()) {
            if (!playbackStarted) {
                spotify.play(deviceID, randomSong);
            } else {
                player.getCurrentState().then((state) => {
                    if (state) {
                        if (!state.paused) {
                            player.pause().then(() => {
                                console.log('Music Paused!');
                            });
                        } else {
                            player.resume().then(() => {
                                console.log('Playback Resumed!');
                            });
                        }
                    } else {
                        reconnect(true);
                    }
                });
            }
        }
    });

    $(likeBtn).on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy() && playbackStarted) {
            spotify.isLiked(currentTrackId, true);
        }
    });

    $(playBtn).on('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy()) {
            if (playbackStarted) {
                player.nextTrack().then(() => {
                    console.log('Skipped to next track!');
                });
            }
        }
    });

    let volTimeout;
    $(musicBox).get(0).addEventListener('wheel', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!playerIsBusy() && playbackStarted) {
            player.getVolume().then((volume) => {
                const volumeStep = 0.05;
                let newVolume;
                (volume !== null) ? volume = parseFloat(volume.toFixed(2)) : volume = 0;
                console.log(volume);
                if (event.deltaY > 0) {
                    //Volume DOWN
                    newVolume = volume - volumeStep;
                    if (newVolume >= 0) player.setVolume(newVolume);
                } else {
                    //Volume UP
                    newVolume = volume + volumeStep;
                    if (newVolume <= 1) player.setVolume(newVolume);
                }

                let roundVolume = (newVolume > 0) ? parseInt(newVolume * 100) : 0;
                if (roundVolume > 0) {
                    clearTimeout(volTimeout);
                    if (roundVolume > 100) roundVolume = 100;
                    $('#mute-warning').removeClass('hide').html(`${roundVolume}%`);
                    volTimeout = setTimeout(() => $('#mute-warning').addClass('hide'), 750);
                } else if (roundVolume <= 0) {
                    clearTimeout(volTimeout);
                    $('#mute-warning').removeClass('hide').html(`<i id="volume-mute" class="fas fa-volume-mute"></i>`);
                }

                console.log(`Volume set to ${roundVolume}%`);
            });
        }

    }, { passive: false });

    $(spotifyIcon).hover(function() {
        $(songInfo).removeClass('hide');
    }, function() {
        $(songInfo).addClass('hide');
    });

    //Helpers
    function reconnect(play = false) {
        updatePlaceholderText('Reconnecting <br> to Spotify...', true);
        spotify.removeLoader(false);
        playerIsReady = false;

        let lastSong;
        const context = currentStateContext.context.uri;
        /* We will test the context uri against this regex
        to see if is it a valid uris recognised but the 
        web API, if the context is not recognised (fox ex 
        the user's favourite playlist) it will just play the last track*/
        const validContext = /:artist|:album|:playlist/;
        if (validContext.test(context)) {
            lastSong = {
                'context_uri': context,
                'offset': { 'uri': currentTrack.uri },
            }
        } else {
            lastSong = { 'uris': [currentTrack.uri] };
        }

        player.connect().then((success) => {
            if (success) {
                console.warn('Reconnected to Spotify');
                setTimeout(() => {
                    spotify.removeLoader();
                    $(musicBox).removeClass('error');
                    if (!play) {
                        updatePlaceholderText('Ready to <br>play!');
                    } else {
                        spotify.play(deviceID, lastSong);
                    }

                    playerIsReady = true;
                }, (play) ? 5000 : 1500);
            } else {
                if (currentTrack.is_playable) {
                    playerIsReady = true;
                    spotify.removeLoader();
                    spotify.play(deviceID, lastSong);
                } else {
                    playerIsReady = false;
                    spotify.throwGenericError(`I can't play this <br>song right now. <a href="${redirectURI}">Reload</a>`);
                }
            }
        })
    }
}
// *** END OF Spotify Player *** //

function playerIsBusy() {
    if (playerIsReady && songIsSelected && premium) {
        return false
    } else {
        return true
    }
}
 