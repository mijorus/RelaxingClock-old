import { likeBtn }               from "../../js/spotify/spotifyPlayerEvents";
import { playbackIcon }          from "../../js/spotify/spotifyPlayerListeners";
import { playlistURL }           from "../../js/spotify/spotifyPlayer";
import { spotifyPlaceholder, 
        musicBox }               from "../../js/spotify/playerInit";
import { getRandomIntInclusive } from "./utils";

export var songIsSelected = false;
export function songSelected(status) {
    songIsSelected = status; 
}

export function playIcon(showPlay) {
    if (showPlay) {
        $(playbackIcon).removeClass('fa-pause').addClass('fa-play');
    } else {
        $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
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

var songTl;
export const scrollText = {
    scrollDuration: 15000,

    scroll: function(target, scrollWidth, vpWidth, delay) {
        songTl.add({
            targets: target,
            delay: delay,
            translateX: - scrollWidth,
            duration: this.scrollDuration,
            complete: function() {
                target.style.translateX = 0;
            }
        }, '+=50')
        .add({
            translateX: [vpWidth + 10, 0],
            duration: this.scrollDuration
        });
    },

    play: function(target, scrollWidth, vpWidth, delay) {
        if (!songTl) songTl = anime.timeline({easing: cbDefault, autoplay: false, loop: 3});
        this.scroll(target, scrollWidth, vpWidth, delay);
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