import { likeBtn }               from "../spotify/userEvents";
import { playbackIcon }          from "../spotify/playerListeners";
import { playlistURL }           from "../spotify/player";
import { spotifyPlaceholder, 
        musicBox }               from "../spotify/init";
import { getRandomIntInclusive,
        changeBtnLable }         from "./utils";
import { cbDefault }             from '../init';

export var songIsSelected = false;
export function songSelected(status) {
    songIsSelected = status; 
}

export function playIcon(musicIsPlaying) {
    if (musicIsPlaying) {
        $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
    } else {
        $(playbackIcon).removeClass('fa-pause').addClass('fa-play');
    }
}

export function songSelection(playlist, random = true) {
    const playlistLength = playlist.tracks.total;
    const playlistOffset = (random)
        ? getRandomIntInclusive(0, playlistLength)
        : 0
    
    console.log(`There are ${playlistLength} songs in the playlist, I have selected the #${playlistOffset}`);

    return {
        'context_uri': `spotify:playlist:${playlistURL}`,
        'offset': {
            'position': playlistOffset
        }
    }
}

export function handleHeartButton(songIsLiked) {
    if (songIsLiked) {
        $(likeBtn).children('#like-icon')
            .removeClass('far').addClass('fas');
    } else {
        $(likeBtn).children('#like-icon')
            .removeClass('fas').addClass('far');  
    }
}

const spotifyStatusText = $('#spotify-status-text');
export function updateStatusText (message) {
    $(spotifyStatusText).text(message);
}

export function updatePlaceholderText(text, error = false) {
    $(spotifyPlaceholder).html(text);
    if (error) $(musicBox).addClass('error');
}

export var currentPlaylist = undefined;
export function updatePlaylistBox(details) {
    if (currentPlaylist !== details || !currentPlaylist) {
        changeBtnLable($('#default-playlist-text'), details.name);
    }
    currentPlaylist = details;
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