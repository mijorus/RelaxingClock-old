import {clockContainer,
        clockInnerCont }  from "../init";
import { centerContainer,
        hours,
        min,
        sec  } from "../clocks";

var galaxyIsDrawn;

const galaxyClockHtml =
`<div id="galaxy-container" class="toscreensave">
    <div id="galaxy-space">
        <div id="galaxy-dot"></div>
        <div id="galaxy-hours" class="">
            <svg id="galaxy-h-path">
                <path d="" style="stroke:white; fill: none;" />
            </svg>
        </div>
        <div id="galaxy-min" class="">
            <svg id="galaxy-m-path">
        </div>
        <div id="galaxy-seconds" class=">
            <svg id="galaxy-s-path">
        </div>
    </div>
</div>`;

export function loadStyle() {
    $(centerContainer).addClass('galaxy');
    handleGalaxyClock();
}

export function beforeLoad() {
    if (!$('#galaxy-container').length) {
        $(clockInnerCont).append(galaxyClockHtml);
    }

    computeGalaxyClock()
}

export function unloadStyle() {

}

export function startProgression() {}

export function skipInit() {
    galaxyIsDrawn = false;
    handleGalaxyClock();
}

export function resetStyle() { }

//Screen Saver actions
// export function goFullScreen() {}

// export function leaveFullScreen() {}

//

function handleGalaxyClock() {
    
}

function computeGalaxyClock() {
    const ccMargin = parseInt($(clockContainer).css('margin-bottom'))
    const cicHeight = $(clockContainer).height();
    const circleRadius = ((ccMargin) + cicHeight / 2);
    const circleDiameter = circleRadius * 2;
    $('#galaxy-hours').width(circleDiameter).height(circleDiameter)
        .find('path').attr('d', `M ${circleRadius} 0 A ${circleRadius} ${circleRadius} 0 1 1 0 ${circleRadius}`)
}

//M 100 0 A 100 100 0 1 1 100 200