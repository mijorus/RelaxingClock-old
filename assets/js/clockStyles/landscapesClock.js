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
    $('#clock-background').removeClass();
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
    let mySec = sec;

    if (sec % 2 == 0 || !blink) {
        $(bigClock).text(hours + ':' + min + ':' + mySec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + mySec);
    }
}

function loadVideos() {
    const tags = generateTags();
    pixabay.getVideos(tags)
        .done((res) => {
            console.log(res);
            $('#clock-background').append($('<video />', {
                autoplay: true,
                controls: true, 
                loop: true,
            })
                .append(
                    $(`<source />`, {
                        src: res.hits[0].videos.small.url,
                        type: 'video/mp4',
                    })
                ))
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