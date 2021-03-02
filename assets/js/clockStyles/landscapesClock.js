import {
        centerContainer,
        hours,
        min,
        sec
    }                     from "../clocks";
import { bigClock, main } from "../init";
import * as pixabay       from "../pixabay/index";
import { blink }          from "../getSettings";

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
    pixabay.requests.getKey().done(() => loadVideos())
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
    pixabay.requests.getVideos( pixabay.videos.generateTags() )
        .done((res) => {
            bgVideo
                .create()
                .load(res.hits[pixabay.videos.selectNextVideo(res.hits.length)])
                .preload(res.hits[pixabay.videos.selectNextVideo(res.hits.length)])
            
            $(bigClock).on('queueForward', () => {
                bgVideo.preload(res.hits[pixabay.videos.selectNextVideo(res.hits.length)]);
            });
        });
}

const bgVideo = {    
    videos: [],

    findVideo: function(state) {
        if (this.videos.length) {
            if (state === 'active') {
                return this.videos.find((el) => $(el).css('z-index') == 1) || $(this.videos[0]);
            } else if (state === 'hidden') {
                return this.videos.find((el) => $(el).css('z-index') == 0) || $(this.videos[1]);
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
        if (this.findVideo('active').data('cover')) {
            imageIsBright(this.findVideo('active').data('cover'))
                .then((res) => {
                    $(bigClock).removeClass('light dark')
                    res ? $(bigClock).addClass('light') : $(bigClock).addClass('dark');
                })
        }

        this.findVideo('active')
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

        this.findVideo('hidden').css('z-index', '1');

        $(oldActiveVideo)
            .css('z-index', '0')
            .addClass('hide');

        $(bigClock).trigger('queueForward');
        this.play();
    },

    load: function(hit) {
        this.findVideo('active')
            .data('cover', pixabay.videos.getPictureIdUrl(hit))        
            .attr('src', pixabay.videos.getVideoUrl(hit))
            .on('canplaythrough', ({ target }) => {
                $(target).off('canplaythrough');
                $(bigClock).addClass('video-loaded');
                this.play();
            });

        return this;
    },
 
    preload: function(hit) {
        console.log('preloading on', $(this.findVideo('hidden')).attr('id'));
        this.findVideo('hidden')
            .data('cover', pixabay.videos.getPictureIdUrl(hit))
            .attr('src', pixabay.videos.getVideoUrl(hit));

        return this;
    },

    remove: function() {
        this.findVideo('active').trigger('pause');
        $('.pixabay-bg-video').remove();
        this.videos = [];
    }
}