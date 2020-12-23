import { spotifyPlaceholder }   from "./init";
import * as spotify             from "./requests";
import { initPlayerEvents }     from "./userEvents";
import { spotifyError }         from "./errorHandling";
import { player,
        getUserInfo }           from "./player";
import { playIcon,
        scrollText }            from "../utils/playerUtils";
import { displaySongInfo }      from "./displaySongInfo";

export const playbackIcon = $('#playback-icon'),
    spotifyIcon           = $('#spotify-icon');

export var deviceID = undefined,
    playerIsReady   = false,
    currentTrack    = {},
    paused          = true,
    currentTrackUri  = undefined;

export function initSpotifyPlayer() {
    initPlayerEvents();

    const trackName      = $('#track-name'),
        artistName       = $('#artist-name'),
        spotifyTrackInfo = $('#spotify-track-info');

    // Error handling
    player.addListener('initialization_error', function ({ message }) {
        console.error(message);
        spotify.throwGenericError();
    });
    player.addListener('playback_error', function ({ message }) {
        console.error(message);
        player.removeListener('playback_error');
        //reconnect();
    });

    // Playback status updates
    player.addListener('player_state_changed', function (state) {
        if (state) {
            const thisTrack = state.track_window.current_track;
            currentStateContext = state.context;
            currentTrack = (thisTrack) ? thisTrack : currentTrack;

            if (state.paused) {
                paused = true;
                playIcon(false);
            } else {
                paused = false;
                playIcon(true);
            }

            if (currentTrack.uri !== currentTrackUri) {
                console.log('Playing a new track...');
                $(spotifyTrackInfo).removeClass('hide');
                $(spotifyPlaceholder).css('opacity', 0);
                
                const albumImage = currentTrack.album.images[1] || currentTrack.album.images[0];
                if (albumImage.url) {
                    $(spotifyIcon).addClass('has-cover').css({
                        'background-image': `url(${albumImage.url})`
                    });
                }

                currentTrackUri = currentTrack.uri;
                scrollText.stop($(trackName), $(artistName));

                const spWidth = $(spotifyPlaceholder).width();

                $(trackName).text(currentTrack.name);
                animateTitle($(trackName), 2000, spWidth);

                var artistsText = '';
                const artists = currentTrack.artists;
                for (var i = 0; i < artists.length; i++) {
                    artistsText += `${artists[i].name}`
                    if (i !== (artists.length - 1)) {
                        artistsText += `, `
                    }
                }

                $(artistName).text(artistsText);
                animateTitle($(artistName), 4000, spWidth);

                setTimeout(spotify.isLiked(currentTrack.id, false), 250);
                $('#song-info-thumb-placeholder').addClass('hide');
                displaySongInfo({
                    trackName: currentTrack.name,
                    artists: artistsText,
                    albumName: currentTrack.album.name,
                    duration: currentTrack.duration_ms,
                    images: currentTrack.album.images,
                })
            }
        }
    });

    // Ready
    player.addListener('ready', function ({ device_id }) {
        playerIsReady = true;
        deviceID = device_id;
        console.log('Ready with Device ID', deviceID);

        if (localStorage.getItem('premium') === null) {
            getUserInfo();
        }
    });

    // Not Ready
    player.addListener('not_ready', function ({ device_id }) {
        console.log('Device has gone offline', device_id);
    });

    // The user authenticated does not have a valid Spotify Premium subscription
    player.on('account_error', ({ message }) => {
        spotifyError.throwPremiumError(userDetails.id);
        console.error('Failed to validate Spotify account', message);
    });
}

function animateTitle(target, delay, spWidth) {
    const size = $(target).get(0).scrollWidth;
    if (size - 5 > spWidth) {
        const animeProp = {
            targets: $(target),
            translateX: (- size),
            delay: delay,
        }

        scrollText.play(animeProp, spWidth);
    }
}