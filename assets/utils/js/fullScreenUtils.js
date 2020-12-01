//Handle full screen button
import { expandIcon, noSleep, isFullScreen } from "../../js/init";

const elem = document.documentElement;
export function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        $(expandIcon).removeClass('lnr-frame-expand').addClass('lnr-frame-contract');
        noSleep.enable();
        isFullScreen = true;
    }
}

export function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        $(expandIcon).removeClass('lnr-frame-contract').addClass('lnr-frame-expand');
        noSleep.disable();
        isFullScreen = false;
    }
}
