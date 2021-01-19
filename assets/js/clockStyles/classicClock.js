import { bigClock }        from "../init";
import { centerContainer,
        hours,
        min,
        sec }              from "../clocks";

import { blink }           from "../getSettings";

export function loadStyle() {
    $(centerContainer).addClass('classic');
    handleClassicClock();
}

export function beforeLoad() { }

export function unloadStyle() {}

export function startProgression() {}

export function skipInit() {}

export function resetStyle() {}

//Screen Saver actions
//export function goFullScreen() { }

//export function leaveFullScreen() { }
//

function handleClassicClock() {
    let mySec = sec;
    if (hours == '04' && min == '20' && clockFormat === '12h') {
        mySec = '69';
    }

    if (sec % 2 == 0 || !blink) {
        $(bigClock).text(hours + ':' + min + ':' + mySec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + mySec);
    }
}
