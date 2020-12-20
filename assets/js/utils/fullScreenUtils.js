//Handle full screen button
import { expandIcon } from "../init";

var isFullScreen = false;

const elem  = document.documentElement,
    noSleep = new NoSleep();

export function handleExpandIcon() {
    $(expandIcon).on('click', function(event) {
        event.stopPropagation();
        (document.fullscreenElement === null) 
            ? openFullscreen() 
            : closeFullscreen();
    });
}

function openFullscreen() {
    elem.requestFullscreen()
        .then(() => {
            $(expandIcon).removeClass('lnr-frame-expand').addClass('lnr-frame-contract');
            noSleep.enable();
            isFullScreen = true;
        })
}

function closeFullscreen() {
    document.exitFullscreen()
        .then(() => {
            $(expandIcon).removeClass('lnr-frame-contract').addClass('lnr-frame-expand');
            noSleep.disable();
            isFullScreen = false;
        })
}
