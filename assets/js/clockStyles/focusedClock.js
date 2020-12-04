import { bigClock } from "../init";

export function handleFocusedClock() {
    if (sec % 2 == 0) {
        $(bigClock).text(hours + ':' + min);
    } else {
        $(bigClock).text(hours + ' ' + min);
    }
}