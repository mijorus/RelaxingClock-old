//Handle full screen button
var elem = document.documentElement;
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        $(expandIcon).removeClass('lnr-frame-expand');
        $(expandIcon).addClass('lnr-frame-contract');
        noSleep.enable();
        isFullScreen = true;
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        $(expandIcon).removeClass('lnr-frame-contract');
        $(expandIcon).addClass('lnr-frame-expand');
        noSleep.disable();
        isFullScreen = false;
    }
    
}
