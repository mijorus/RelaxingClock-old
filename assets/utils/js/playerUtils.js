import { likeBtn } from "../../js/spotify/spotifyPlayerEvents";

export function playIcon(showPlay) {
    if (showPlay) {
        $(playbackIcon).removeClass('fa-pause').addClass('fa-play');
    } else {
        $(playbackIcon).removeClass('fa-play').addClass('fa-pause');
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