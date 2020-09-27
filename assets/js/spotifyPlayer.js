const likeBtn = $('.like-btn'),
playBtn = $('.play-btn'),
playbackIcon = $('#playback-icon');

var deviceID = undefined,
randomSong = undefined,
playerIsReady = false,
songIsSelected = false,
playbackStarted = false,
favourite = false,
currentTrackId = '';

// *** Spotify Player *** //

if (localStorage.userHasLogged === 'true' && compatibility.login) {
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
            name: 'Relaxing Clocks',
            getOAuthToken: function (callback) {
                if (localStorage.code) {
                    //We request a token for the first time
                    spotify.requestToken();
                }

                else if (localStorage.refreshToken) {
                    //We need to request a new token using the refresh_token
                    spotify.refreshToken();
                }

                $(document).on('loginCompleted', function () {
                    console.info(`Login Completed!`);
                    callback(sessionStorage.accessToken);
                });
            }
        });
        
        initSpotifyPlayer();
    }
}

function initSpotifyPlayer() {
    var currentTrack = {};

    const trackName = $('#track-name'),
    likeBtn = $('.like-btn'),
    artistName = $('#artist-name'),
    spotifyTrackInfo = $('#spotify-track-info'),
    spotifyIcon = $('#spotify-icon'),
    playbackIcon = $('#playback-icon');
    
    // Error handling
    player.addListener('initialization_error', function({message}) {
            console.error(message); 
    });
    player.addListener('authentication_error', function({message}) {
            console.error(message); 
    });
    player.addListener('account_error', function({message}) {
            console.error(message); 
    });
    player.addListener('playback_error', function({message}) {
            console.error(message); 
    });
    
    // Playback status updates
    player.addListener('player_state_changed', function(state) {
        currentTrack = state.track_window.current_track;

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

            const spWidth = $(spotifyPlaceholder).width()

            $(trackName).text(currentTrack.name);
            var titleSize = $(trackName).get(0).scrollWidth
            if (titleSize - 5 > spWidth) {
                scrollText.play($(trackName).get(0), titleSize, spWidth, 2000);
            }

            $(artistName).text(function() {
                var text = '';
                const artists = currentTrack.artists;
                for (var i = 0; i < artists.length; i++) {
                    if (i == (artists.length - 1)) {
                        text += `${artists[i].name}`
                    } else {
                        text += `${artists[i].name}, `
                    }
                }
                return text
            });
            var artistNameSize = $(artistName).get(0).scrollWidth;
            if (artistNameSize - 5 > spWidth) {
                scrollText.play($(artistName).get(0), titleSize, spWidth, 4000);
            }
            setTimeout(spotify.isLiked(currentTrackId, false), 250);
        }
    });
    
    // Ready
    player.addListener('ready', function({device_id}) {
        setTimeout(function() {
            spotify.getUserDetails(false);
        }, 1000);
        playerIsReady = true;
        deviceID = device_id;
        spotify.selectSong()
        console.log('Ready with Device ID', deviceID);
    });
    
    // Not Ready
    player.addListener('not_ready', function({device_id}) {
        console.log('Device ID has gone offline', device_id);
    });
    
    // Connect to the player!
    player.connect();

    //Listeners
    $(playBtn).on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy()) {
            if (!playbackStarted) {
                spotify.play(deviceID, randomSong);
            } else {
                player.getCurrentState().then(state => {
                    if (!state.paused) {
                        player.pause().then(() => {
                            console.log('Music Paused!');                        
                        });
                    } else {
                        player.resume().then(() => {
                            console.log('Playback Resumed!');
                        });
                    }
                });
            }
        }
    });

    $(likeBtn).on('click', function(event) {
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

    $(musicBox).get(0).addEventListener('wheel', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const volumeStep = 0.1;

        player.getVolume().then(volume => {
            if (event.deltaY > 0) {
                const newVolume = volume - volumeStep;
                if (newVolume > 0) {
                    console.log(`Volume down, set to ${Math.round(newVolume * 100)}%`);
                    player.setVolume(newVolume);
                } else {
                    $('#mute-warning').removeClass('hide');
                }
            } else {
                const newVolume = volume + volumeStep;
                if (newVolume <= 1) {
                    console.log(`Volume up, set to ${Math.round(newVolume * 100)}%`);
                    $('#mute-warning').addClass('hide');
                    player.setVolume(newVolume);
                } 
            } 
        });

        

    }, { passive: false })
}
// *** END OF Spotify Player *** //

function playerIsBusy() {
    if (playerIsReady && songIsSelected && premium) {
        return false
    } else {
        return true
    }
}
 