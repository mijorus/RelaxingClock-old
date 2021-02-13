import { bigClock, 
        main,
        clockInnerCont,
        cbDefault,
        eaElasticDefault }   from "../init";
import { centerContainer,
        hours,
        min,
        sec  }               from "../clocks";
import { newRandomPlace,
        aRandomPlace, }      from "./internationalClock/internationalClock";
import { blink }             from "../getSettings";

var selectedCity = undefined;

export function loadStyle() {
    $(main).addClass('metro');
    $(centerContainer).addClass('metro');
    handleMetroClock();
}

export function beforeLoad() {
    if (!selectedCity) selectedCity = newRandomPlace();
    $('#clock-background').removeClass().addClass(selectedCity.city.class);
}

export function unloadStyle() {
    selectedCity = undefined;
}

export function startProgression() {}

export function skipInit() {}

export function resetStyle() {
    $('#clock-background').addClass(aRandomPlace.city.class);
}

//Screen Saver actions
export function goFullScreen() {  
    $(clockInnerCont).addClass('metro-margin');
    return anime({
        targets: $(bigClock).get(0),
        easing: cbDefault,
        duration: 2000,
        delay: 50,
        scale: ( $(window).height() * 0.85 ) / $(bigClock).height(),
        complete: function () {
            $(clockInnerCont).removeClass('metro-margin');
        }
    });
}

export function leaveFullScreen() { 
    return anime({
        targets: $(bigClock).get(0),
        scale: 1,
        easing: eaElasticDefault,
        duration: 2500,
    });
}

//

function handleMetroClock() {
    if (sec % 2 == 0 || !blink) {
        $(bigClock).html(hours + '<br>' + '&middot' + '<br>' + min);
    } else {
        $(bigClock).html(hours + '<br>' + ' ' + '<br>' + min);
    }
}