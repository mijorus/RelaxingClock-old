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
        .off('queueForward')
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

var currentVideoIndex = undefined;
function selectNextVideo({ length }) {
    if (currentVideoIndex === undefined) {
        currentVideoIndex = getRandomIntInclusive(0, length - 1);
        return currentVideoIndex;
    } else if (currentVideoIndex === length - 1) {
        return  0;
    } else {
        return currentVideoIndex++;
    }
}

function loadVideos() {
    pixabay.getVideos( generateTags() )
        .done((res) => {
            bgVideo
                .create()
                .load(res.hits[selectNextVideo(res.hits)].videos.medium.url)
                .preload(res.hits[selectNextVideo(res.hits)].videos.medium.url)
            
            $(bigClock).on('queueForward', () => bgVideo.preload(res.hits[selectNextVideo(res.hits)].videos.medium.url))
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

    findVideo: function(state) {
        if (this.videos.length) {
            if (state === 'active') {
                return this.videos.find((el) => $(el).css('z-index') == 1) || this.videos[0];
            } else if (state === 'hidden') {
                return this.videos.find((el) => $(el).css('z-index') == 0) || this.videos[1];
            }
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

    play: function() {
        console.log('playing on', this.findVideo('active').attr('id'));

        $(this.findVideo('active'))
            .trigger('play')
            .removeClass('hide')
            .on('ended', ({ target }) => {
                $(target).off('ended');
                this.playNext();
            });

        return this;
    },

    playNext: function() {
        const oldActiveVideo = this.findVideo('active');

        $(this.findVideo('hidden'))
            .css('z-index', '1');

        $(oldActiveVideo)
            .css('z-index', '0')
            .addClass('hide');

        $(bigClock).trigger('queueForward');
        this.play();
    },

    load: function(src) {
        $(this.findVideo('active'))
            .attr('src', src)
            .on('canplaythrough', ({ target }) => {
                $(target).off('canplaythrough');
                $(bigClock).addClass('video-loaded');
                this.play();
            });

        return this;
    },
 
    preload: function(src) {
        console.log('preloading on', $(this.findVideo('hidden')).attr('id'));
        $(this.findVideo('hidden'))
            .attr('src', src);

        return this;
    },

    remove: function() {
        $(this.findVideo('active')).trigger('pause');
        $('.pixabay-bg-video').remove();
        this.videos = [];
    }
}