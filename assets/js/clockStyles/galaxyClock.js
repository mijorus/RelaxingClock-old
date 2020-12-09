/* 
    HUGE thanks to @opsb [user on stackoverflow]
    for the code that powers the svg
    https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle 
*/

import {clockContainer,
        clockInnerCont }  from "../init";
import { centerContainer,
        hours,
        min,
        sec  } from "../clocks";
import anime from "vendors/anime/anime";

var cicHeight,
    galaxyAnim,
    galaxyIsDrawn,
    galaxyHours,
    galaxyMin,
    galaxySec, 
    galaxyHoursDiam,
    galaxyMinDiam,
    galaxySecDiam,
    galaxyHoursRad,
    galaxyMinRad,
    galaxySecRad;

const galaxyClockHtml =
`<div id="galaxy-container" class="toscreensave">
    <div id="galaxy-space">
        <div id="galaxy-dot"></div>
        <div id="galaxy-hours" class="galaxy-orbit">
            <svg id="galaxy-h-path">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-min" class="galaxy-orbit">
            <svg id="galaxy-m-path">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-sec" class="galaxy-orbit">
            <svg id="galaxy-s-path">
                <path d="" />
            </svg>
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

    if (!galaxyHours) galaxyHours = $('#galaxy-hours');
    if (!galaxyMin) galaxyMin = $('#galaxy-min');
    if (!galaxySec) galaxySec = $('#galaxy-sec');

    if ($(clockContainer).height() !== cicHeight) {
        computeGalaxyClockSize();
    }
}

export function unloadStyle() {
    if (galaxyAnim) {
        galaxyAnim.pause();
        galaxyAnim = undefined;
    }
}

export function startProgression() {
    galaxyAnim = anime.timeline({
        targets: '.galaxy-orbit',
        opacity: [1, 0.2, 1],
        delay: anime.stagger(250),
        duration: 750,
        easing: 'easeOutQuad',
        loop: 3,
        direction: 'reverse'
    })
        .add({
            targets: '.galaxy-orbit',
            opacity: [1, 0.2],
            easing: 'easeOutQuad',
            direction: 'reverse'
        }, '+=10')
}

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
    $(galaxyHours).find('path').attr('d', (describeArc(galaxyHoursRad, galaxyHoursRad, galaxyHoursRad, 0, (hours * 30))));
    $(galaxyMin).find('path').attr('d', (describeArc(galaxyMinRad, galaxyMinRad, galaxyMinRad, 0, (min * 6))));
    $(galaxySec).find('path').attr('d', (describeArc(galaxySecRad, galaxySecRad, galaxySecRad, 0, (sec * 6))));
}

function computeGalaxyClockSize() {
    const ccMargin = parseInt($(clockContainer).css('margin-bottom'))
    cicHeight = $(clockContainer).height();
    const circleDiameter = ((ccMargin) + cicHeight / 2) * 2;

    galaxyHoursDiam = circleDiameter;
    galaxyMinDiam = circleDiameter / 1.5;
    galaxySecDiam = circleDiameter / 3;

    galaxyHoursRad = galaxyHoursDiam / 2;
    galaxyMinRad = galaxyMinDiam / 2;
    galaxySecRad = galaxySecDiam /2;

    $(galaxyHours).width(galaxyHoursDiam).height(circleDiameter);
    $(galaxyMin).width(galaxyMinDiam).height(galaxyMinDiam);
    $(galaxySec).width(galaxySecDiam).height(galaxySecDiam);
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = (endAngle - startAngle <= 180) ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}