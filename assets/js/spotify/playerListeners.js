import { musicBox, spotifyPlaceholder }   from "./init";
import * as spotify             from "./requests";
import { initPlayerEvents }     from "./userEvents";
import { spotifyError }         from "./errorHandling";
import { player,
        getUserInfo }           from "./player";
import * as utils               from "../utils/playerUtils";
import { displaySongInfo }      from "./displaySongInfo";
import { getElementDetails }    from "./playlists/elementDetails";
import { startPeriodicDeviceCheck } from "./reconnect";

export const playbackIcon = $('#playback-icon'),
    spotifyIcon           = $('#spotify-icon');

export var deviceID = undefined,
    playerIsReady   = false,
    currentTrack    = undefined,
    savedState      = undefined,
    paused          = true,
    currentTrackUri  = undefined;

var trackName, artistName, spotifyTrackInfo;

export function initSpotifyPlayer() {
    initPlayerEvents();

    trackName      = $('#track-name');
    artistName       = $('#artist-name');
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
            currentTrack = (thisTrack) ? thisTrack : currentTrack;
            savedState = state;

            if (state.paused) {
                paused = true;
                utils.playIcon(false);
            } else {
                paused = false;
                utils.playIcon(true);
            }

            if (currentTrack.uri !== currentTrackUri) {
                updateMusicBox(state, currentTrack)
            }
        }
    });

    // Ready
    player.addListener('ready', function ({ device_id }) {
        playerIsReady = true;
        deviceID = device_id;
        console.log('Ready with Device ID', deviceID);
        startPeriodicDeviceCheck();

        if (localStorage.getItem('premium') === null) {
            getUserInfo();
        }
    });

    // Not Ready
    player.addListener('not_ready', function () {
        console.log('Device has gone offline');
        utils.changeOnlineStatus();
    });

    // The user authenticated does not have a valid Spotify Premium subscription
    player.on('account_error', ({ message }) => {
        spotifyError.throwPremiumError(userDetails.id);
        console.error('Failed to validate Spotify account', message);
    });
}

export function updateMusicBox(state = savedState, track = currentTrack) {
    if (state && track) {
        console.log('Playing a new track...');

        $(musicBox).removeClass('busy');
        $(spotifyTrackInfo).removeClass('hide');
        utils.updatePlaceholderText('', false, true);
        utils.updatePlaylistBox(getElementDetails({ ...state, type: 'context' }))

        const albumImage = track.album.images[1] || track.album.images[0];
        if (albumImage.url) utils.updateSpotifyIcon(albumImage.url, 'image');

        currentTrackUri = track.uri;
        utils.scrollText.stop($(trackName), $(artistName));

        const spWidth = $('#spotify-text').width();

        $(trackName).text(track.name);
        animateTitle($(trackName), 2000, spWidth);

        var artistsText = '';
        const artists = track.artists;
        for (var i = 0; i < artists.length; i++) {
            artistsText += `${artists[i].name}`
            if (i !== (artists.length - 1)) {
                artistsText += `, `
            }
        }

        $(artistName).text(artistsText);
        animateTitle($(artistName), 4000, spWidth);

        setTimeout(spotify.isLiked(track.id, false), 250);
        $('#song-info-thumb-placeholder').addClass('hide');
        displaySongInfo({
            trackName: track.name,
            artists: artistsText,
            albumName: track.album.name,
            duration: track.duration_ms,
            images: track.album.images,
        })
    }
}

function animateTitle(target, delay, spWidth) {
    const size = $(target).get(0).scrollWidth;
    if (size - 5 > spWidth) {
        const animeProp = {
            targets: $(target),
            translateX: (- size),
            delay: delay,
        }

        utils.scrollText.play(animeProp, spWidth);
    }
}