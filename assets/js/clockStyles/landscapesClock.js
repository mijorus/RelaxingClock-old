import { bigClock, main } from "../init";
import * as pixabay from "../pixabay/requests";

export function loadStyle() {
    $(centerContainer).addClass('landscape');
    handleLandscapeClock();
}

export function beforeLoad() { }

export function unloadStyle() { }

export function startProgression() { 
    pixabay.getKey.done(() => loadVideos())
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
    pixabay.getVideos()
}