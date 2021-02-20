import {
        centerContainer,
        hours,
        min,
        sec
    }                     from "../clocks";
import { bigClock, main } from "../init";
import * as pixabay       from "../pixabay/requests";
import { blink }          from "../getSettings";
import { getRandomIntInclusive } from "js/utils/utils";

export function loadStyle() {
    $(main).addClass('landscape');
    handleLandscapeClock();
}

export function beforeLoad() { 
    $('#clock-background')
        .removeClass()
        .addClass('landscape-background');
}

export function unloadStyle() { 
    bgVideo.remove();
    $(main).removeClass('landscape');
    $('#clock-background').removeClass();
    $(bigClock)
        .on('queueForward')
        .removeClass('video-loaded');
}

export function startProgression() { 
    pixabay.getKey().done(() => loadVideos())
}

export function skipInit() { }

export function resetStyle() { }

//Screen Saver actions
//export function goFullScreen() { }

//export function leaveFullScreen() { }
//

function handleLandscapeClock() {
    if (sec % 2 == 0 || !blink) {
        $(bigClock).text(hours + ':' + min);
    } else {
        $(bigClock).text(hours + ' ' + min);
    }
}

function loadVideos() {
    pixabay.getVideos( generateTags() )
        .done((res) => {
            console.log(res);
            const randomVideo = getRandomIntInclusive(0, res.hits.length);
            bgVideo
                .create()
                .play(res.hits[randomVideo].videos.medium.url)
                .preload(res.hits[randomVideo + 1].videos.medium.url)
            
            $(bigClock).on('queueForward', () => bgVideo.preload(res.hits[randomVideo + 2].videos.medium.url))
        })
}

function generateTags() {
    const tags = [
        ['drone', 'mountain'],
        ['drone', 'sea'],
        ['drone', 'summer'],
        ['drone', 'snow'],
    ]

    return tags[getRandomIntInclusive(0, (tags.length - 1))];
}

const bgVideo = {    
    videos: [],

    activeVideo: function() {
        if (this.videos.length) {
            return this.videos.find((el) => $(el).css('z-index') === 1) || this.videos[0];
        }
    },

    hiddenVideo: function() {
        if (this.videos.length) {
            return this.videos.find((el) => $(el).css('z-index') == 0) || this.videos[1];
        }
    },

    create: function() {
        if (this.videos.length === 0) {
            for (i = 0; i < 2; i++) {
                this.videos.push( 
                    $('<video />', {
                        id: 'pixabay-video-' + i,
                        controls: false,
                        muted: true,
                        loop: false,
                        autoplay: false,
                        preload: 'auto',
                        class: 'hide soft-show pixabay-bg-video absolute top-left-0',
                    })
                );

                $('#clock-background').append(this.videos[i]);
            }
        }

        return this;
    },

    play: function(src) {
        $(bigClock).addClass('video-loaded');
        $(this.activeVideo())
            .attr('src', src)
            .on('canplaythrough', ({ target }) => $(target).triggerBgVideoPlay())
            .on('ended', () => this.playNext());

        return this;
    },

    playNext: function() {
        $(this.hiddenVideo())
            .trigger('play')
            .removeClass('hide')
            .css('z-index', 1);

        $(this.activeVideo())
            .css('z-index', 0)
            .addClass('hide');

        $(bigClock).trigger('queueForward');
    },

    preload: function(src) {
        console.log(this.hiddenVideo());
        $(this.hiddenVideo())
            .attr('src', src);

        return this;
    },

    remove: function() {
        $('.pixabay-bg-video').remove();
        this.videos = [];
    }
}