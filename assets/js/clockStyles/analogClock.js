import { clockContainer }   from "../init";
import { centerContainer }  from "../clocks";

var handColor,
    handhours,
    handmin,
    handsec,
    circleIsdrawn = false;

export function loadStyle() {
    $(centerContainer).addClass('analog');
    handleAnalogClock();
}

export function beforeLoad() {}

export function unloadStyle() { }

export function startProgression() {
    randomHandColor();
    loadStyle();
}

export function skipInit() { 
    circleIsdrawn = false;
    handleAnalogClock();
}

export function resetStyle() { }

//Screen Saver actions
// export function goFullScreen() {}

// export function leaveFullScreen() {}

//

function handleAnalogClock() {
    if (!handhours) handhours = $('#hand-hours');
    if (!handmin)   handmin   = $('#hand-min');
    if (!handsec)   handsec   = $('#hand-seconds');

    if (!circleIsdrawn) {
        computeAnalogSize();
    } else {
        fullHandMovement();
    }
}

function randomHandColor() {
    handColor = randomColor({ luminosity: 'light' });
}

function computeAnalogSize() {
    const ccMargin = parseInt($(clockContainer).css('margin-bottom'))
    const cicHeight = $(clockContainer).height();
    const circle = $('#circle');
    const circleRadius = ((ccMargin) + cicHeight / 2);
    const circleDiameter = circleRadius * 2;
    $(circle).width(circleDiameter);
    $(circle).height(circleDiameter);

    $(handsec).height((circleRadius * 80) / 100);
    $(handmin).height((circleRadius * 60) / 100);
    $(handhours).height((circleRadius * 40) / 100);

    circleIsdrawn = true;

    fullHandMovement();
}

function fullHandMovement() {
    $(handhours).css('transform', `translate(-50%, -100%) rotate(${(hours * 30) + (min / 2)}deg)`);
    $(handmin).css('transform', `translate(-50%, -100%) rotate(${(min * 6) + (sec / 10)}deg)`);
    $(handsec).css({
        'transform': `translate(-50%, -100%) rotate(${sec * 6}deg)`,
        'background-color': handColor
    });
}