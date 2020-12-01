export const likeBtn, playBtn, songInfo;

export function initPlayerEvents() {
    const likeBtn = $('.like-btn'),
    playBtn       = $('.play-btn'),
    songInfo      = $('#song-info');
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

    $(spotifyIcon).hover(() => {
        $(songInfo).removeClass('hide');
    }, () => {
        $(songInfo).addClass('hide');
    });
}

function reconnect(play = false) {
    updatePlaceholderText('Reconnecting <br> to Spotify...', true);
    spotify.removeLoader(false);
    playerIsReady = false;

    let lastSong;
    const context = currentStateContext.uri;
    /* We will test the context uri against this regex
    to see if is it a valid uris recognised but the 
    web API, if the context is not recognised (for ex 
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

    spotify.findDevices()
        .done(function (response) {
            console.log(response);
            for (device of response.devices) {
                if (device.id !== deviceID && device.is_active) {
                    spotify.removeLoader(true);
                    updatePlaceholderText(`${device.name}`, false);
                    $(spotifyIcon).removeClass('has-cover').css('background-image', 'none');
                    playIcon(true);
                }
            }
        })
        .fail(function (error) {
            spotify.logError('CANNOT GET DEVICES LIST', error);
        });
}