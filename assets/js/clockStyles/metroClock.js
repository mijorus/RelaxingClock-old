export function handleMetroClock() {
    if (sec % 2 == 0) {
        $(bigClock).html(hours + '<br>' + '·' + '<br>' + min);
    } else {
        $(bigClock).html(hours + '<br>' + ' ' + '<br>' + min);
    }
}