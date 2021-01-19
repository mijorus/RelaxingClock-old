import { bigClock }        from "../init";
import { centerContainer,
        hours,
        min,
        sec  }             from "../clocks";
import { blink }           from "../getSettings";

export function loadStyle() {
    $(centerContainer).addClass('focused');
    handleFocusedClock();
}

export function beforeLoad() { }

export function unloadStyle() { }

export function startProgression() { }

export function skipInit() { }

export function resetStyle() { }

//Screen Saver actions
//export function goFullScreen() { }

//export function leaveFullScreen() { }
//

function handleFocusedClock() {
    if (sec % 2 == 0 || !blink) {
        $(bigClock).text(hours + ':' + min);
    } else {
        $(bigClock).text(hours + ' ' + min);
    }
}

