function handleHeartButton(songIsLiked) {
    if (songIsLiked) {
        $(likeBtn).children('#like-icon').removeClass('far');
        $(likeBtn).children('#like-icon').addClass('fas');
    } else {
        $(likeBtn).children('#like-icon').removeClass('fas');
        $(likeBtn).children('#like-icon').addClass('far');  
    }
}

function updateStatusText (message) {
    const spotifyStatusText = '#spotify-status-text';
    $(spotifyStatusText).text(message);
}

var songTl = anime.timeline ({
    easing: cbDefault,
    autoplay: false,
    loop: 3
});

const scrollDuration = 10000;
var scrollText = {
    scroll: function(target, scrollWidth, vpWidth, delay) {
        songTl.add({
            targets: target,
            delay: delay,
            translateX: - scrollWidth,
            duration: scrollDuration,
            complete: function() {
                target.style.translateX = 0;
            }
        })
        .add({
            targets: target,
            translateX: [vpWidth + 10, 0],
            duration: scrollDuration
        })
    },

    play: function(target, scrollWidth, vpWidth, delay) {
        this.scroll(target, scrollWidth, vpWidth, delay);
        songTl.restart();
    },

    stop: function(...targets) {
        songTl.pause();
        for (el of targets) {
            $(el).css('transform', 'translateX(0px)');
        }
    }
}