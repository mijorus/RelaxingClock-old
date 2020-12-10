import { clockContainer,
        clockInnerCont }    from "../init";
import { centerContainer,
        hours,
        min,
        sec  }              from "../clocks";

var handColor,
    handhours,
    handmin,
    handsec,
    circle;

const analogClockHtml = 
`<div id="circle-container" class="toscreensave">
    <div id="circle">
        <span id="little-dot"></span>
        <span id="hand-hours" class="hand smooth-move"></span>
        <span id="hand-min" class="hand smooth-move"></span>
        <span id="hand-seconds" class="hand"></span>
    </div>
</div>`;

export function loadStyle() {
    $(centerContainer).addClass('analog');
    handleAnalogClock();
}

export function beforeLoad() {
    if (!$('#circle-container').length) {
        $(clockInnerCont).append(analogClockHtml);
        circle = $('#circle');

        handhours = $(circle).find($('#hand-hours'));
        handmin = $(circle).find($('#hand-min'));
        handsec = $(circle).find($('#hand-seconds'));

        computeAnalogSize();
    }
}

export function unloadStyle() {
   
}

export function startProgression() {
    handColor = randomColor({ luminosity: 'light' });
    loadStyle();
}

export function skipInit() { 
    computeAnalogSize();
    handleAnalogClock();
}

export function resetStyle() {}

//Screen Saver actions
// export function goFullScreen() {}

// export function leaveFullScreen() {}

//

function handleAnalogClock() {
    $(handhours).css('transform', `translate(-50%, -100%) rotate(${(hours * 30) + (min / 2)}deg)`);
    $(handmin).css('transform', `translate(-50%, -100%) rotate(${(min * 6) + (sec / 10)}deg)`);
    $(handsec).css({
        'transform': `translate(-50%, -100%) rotate(${sec * 6}deg)`,
        'background-color': handColor
    });
}

function computeAnalogSize() {
    const ccMargin = parseInt($(clockContainer).css('margin-bottom'))
    const cicHeight = $(clockContainer).height();
    const circleRadius = ((ccMargin) + cicHeight / 2);
    const circleDiameter = circleRadius * 2;
    $(circle).width(circleDiameter).height(circleDiameter);
    $(handsec).height((circleRadius * 80) / 100);
    $(handmin).height((circleRadius * 60) / 100);
    $(handhours).height((circleRadius * 40) / 100);
}