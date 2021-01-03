import { likeBtn }               from "../spotify/userEvents";
import { playbackIcon,
        spotifyIcon }            from "../spotify/playerListeners";
import { spotifyPlaceholder,
        musicBox }               from "../spotify/init";
import { getRandomIntInclusive,
        changeBtnLable }         from "./utils";
import { cbDefault }             from '../init';

export var songIsSelected = false;
export function songSelected(status) {
    songIsSelected = status; 
}

// Change the icon of the play button
export function playIcon(musicIsPlaying) {
    if (musicIsPlaying) {
        $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
    } else {
        $(playbackIcon).removeClass('fa-pause').addClass('fa-play');
    }
}

// Select a random track from a playlist before 
// starting the playback
export function songSelection(playlist, random = true) {
    const playlistLength = playlist.tracks.total;
    const playlistOffset = (random)
        ? getRandomIntInclusive(0, playlistLength)
        : 0
    
    console.log(`There are ${playlistLength} songs in the playlist, I have selected the #${playlistOffset}`);

    return {
        'context_uri': `spotify:playlist:${playlist.id}`,
        'offset': {
            'position': playlistOffset
        }
    }
}

// Change the icon of the heart button in the music box
export function handleHeartButton(songIsLiked) {
    if (songIsLiked) {
        $(likeBtn).children('#like-icon')
            .removeClass('far').addClass('fas');
    } else {
        $(likeBtn).children('#like-icon')
            .removeClass('fas').addClass('far');  
    }
}

// Change the content of the status text
const spotifyStatusText = $('#spotify-status-text');
export function updateStatusText (message) {
    $(spotifyStatusText).text(message);
}

export function updatePlaceholderText(text, error = false, hide = false) {
    $(spotifyPlaceholder).html(text);
    if (error) $(musicBox).addClass('error');

    if (hide) {
        $(spotifyPlaceholder).css('opacity', 0);
        $('#spotify-track-info').css('opacity', 1);
    } else {
        $(spotifyPlaceholder).css('opacity', 1);
        $('#spotify-track-info').css('opacity', 0);
    }
}

export var currentPlaylist = undefined;
export function updatePlaylistBox(details) {
    if (currentPlaylist !== details || !currentPlaylist) {
        changeBtnLable($('#default-playlist-text'), details.name);
    }
    currentPlaylist = details;
}

// Dims the color of the Spotify Box if the PWA is running offline
export function changeOnlineStatus(online = false) {
    if (online) {
        return;
    } else {
        console.warn('Device is offline');
        $('#spotify-status-box').addClass('unavailable');
        updateStatusText(`You are currently offline`);
        $(musicBox).removeClass('logged unlogged').addClass('unsupported');
    }
}


const defaultSpotifyIconClass = $(spotifyIcon).attr('class').split(/\s+/);
/**
 * 
 * @param {String} content 
 * @param {String} type image, icon, default
 */
export function updateSpotifyIcon(content, type = 'image') {
    switch (type) {
        case 'image':
            $(spotifyIcon).addClass('has-cover').css({
                'background-image': `url(${content})`
            });
            break;
        
        case 'icon':
            $(spotifyIcon).removeClass('has-cover fab fa-spotify')
                .css('background-image', 'none')
                .addClass(content);
            break;

        case 'default': 
            $(spotifyIcon).removeClass('has-cover')
                .css('background-image', 'none')
                .addClass(defaultSpotifyIconClass)
            break;
    }
}
var songTl;
export const scrollText = {
    scrollDuration: 15000,

    scroll: function (animationProp, vpWidth) {
        songTl
            .add({
                translateX: animationProp.translateX,
                duration: this.scrollDuration,
                complete: function() {
                    $(animationProp.targets).css('translateX', 0);
                }
            }, '+=50')
            .add({
                translateX: [(vpWidth + 10), 0],
                duration: this.scrollDuration,
            });
    },

    play: function (animationProp, vpWidth) {
        if (!songTl) {
            songTl = anime.timeline({
                targets: $(animationProp.targets).get(0),
                easing: cbDefault,
                autoplay: false,
                loop: true
            });
        }

        this.scroll(animationProp, vpWidth);
        songTl.restart();
    },

    stop: function(...targets) {
        if (songTl) songTl.pause();
        songTl = undefined;
        for (el of targets) {
            $(el).css('transform', 'translateX(0px)');
        }
    }
}