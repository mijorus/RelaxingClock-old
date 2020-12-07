import { bigClock, 
        main,
        clockInnerCont,
        cbDefault,
        eaElasticDefault }   from "../init";
import { centerContainer }   from "../clocks";
import { newRandomPlace,
        aRandomPlace }      from "../../utils/js/internationalClock/internationalClock";

export function loadStyle() {
    $(main).addClass('metro');
    $(centerContainer).addClass('metro');
    handleMetroClock();
}

export function beforeLoad() {
    const metroBg = $('#metro-background');
    $(metroBg).removeClass();
    newRandomPlace(false);
    $(metroBg).addClass(aRandomPlace.city.class);
}

export function unloadStyle() { }

export function startProgression() {}

export function skipInit() { }

export function resetStyle() {
    newRandomPlace(false);
    $('#metro-background').addClass(aRandomPlace.city.class);
}

//Screen Saver actions
export function goFullScreen() {  
    $(clockInnerCont).addClass('metro-margin');
    return anime({
        targets: $(bigClock).get(0),
        easing: cbDefault,
        duration: 2000,
        delay: 50,
        scale: () => {
            return (($(window).height() * 0.85) / $(bigClock).height());
        },
        complete: function () {
            //screenSaverisAnimating = false;
            $(clockInnerCont).removeClass('metro-margin');
        }
    });
}

export function leaveFullScreen() { 
    return anime({
        targets: $(bigClock).get(0),
        scale: [1.8, 1],
        easing: eaElasticDefault,
        duration: 2500,
    });
}

//

function handleMetroClock() {
    if (sec % 2 == 0) {
        $(bigClock).html(hours + '<br>' + '·' + '<br>' + min);
    } else {
        $(bigClock).html(hours + '<br>' + ' ' + '<br>' + min);
    }
}