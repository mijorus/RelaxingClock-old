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
    $(main).removeClass('landscape');
    $(bigClock).removeClass('video-loaded');
    $('#clock-background').removeClass();
    bgVideo.remove();
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
            bgVideo.create(res.hits[randomVideo].videos.medium.url)
            $(bgVideo.element).on('ended', function() {
                console.log('end');
            })
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
    element: undefined,

    create: function(src, autoplay = true) {
        this.element = $('<video />', {
            id: 'pixabay-video',
            controls: false,
            muted: true,
            loop: false,
            class: 'hide soft-show',
        })
            .append( $(`<source />`, { src: src, type: 'video/mp4' }) )
            .on('canplaythrough ', () => this.play())

        $('#clock-background').append(this.element)
            

        return this;
    },

    play: function() {
        $(bigClock).addClass('video-loaded');
        $(this.element)
            .removeClass('hide')
            .get(0).play(); 
    },

    remove: function() {
        if (this.element) {
            $(this.element).remove();
        }
    }
}