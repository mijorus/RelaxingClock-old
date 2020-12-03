export default function handleClassicClock() {
    let mySec = sec;
    if (hours == '04' && min == '20' && clockFormat === '12h') {
        mySec = '69';
    }

    if (sec % 2 == 0) {
        $(bigClock).text(hours + ':' + min + ':' + mySec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + mySec);
    }
}