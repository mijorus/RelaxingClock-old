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

function updatePlaceholderText(text, error = false) {
    $(spotifyPlaceholder).html(text);
    if (error) $(musicBox).addClass('error');
}

var songTl;

var scrollText = {

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
            targets: target,
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