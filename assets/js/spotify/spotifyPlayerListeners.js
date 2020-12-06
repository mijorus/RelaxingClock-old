import { spotifyPlaceholder }   from "./playerInit";
import { spotify }              from "./spotifyRequests";
import { initPlayerEvents }     from "./spotifyPlayerEvents";
import { spotifyError }         from "./spotifyErrorHandling";
import { player }               from "./spotifyPlayer";
import { playIcon }             from "../../utils/js/playerUtils";

export const playbackIcon = $('#playback-icon'),
    spotifyIcon           = $('#spotify-icon');

export var deviceID = undefined,
    playerIsReady   = false,
    currentTrack    = {},
    currentTrackId  = undefined;

export function initSpotifyPlayer() {
    initPlayerEvents();

    const trackName = $('#track-name'),
        artistName = $('#artist-name'),
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
                playIcon(false);
            }

            if (currentTrack.id !== currentTrackId) {
                console.log('Playing a new track...');
                $(spotifyTrackInfo).removeClass('hide');
                $(spotifyPlaceholder).css('opacity', 0);
                if (currentTrack.album.images[1].url) {
                    $(spotifyIcon).addClass('has-cover').css({
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

    // The user authenticated does not have a valid Spotify Premium subscription
    player.on('account_error', ({ message }) => {
        spotifyError.throwPremiumError(userDetails.id);
        console.error('Failed to validate Spotify account', message);
    });
}