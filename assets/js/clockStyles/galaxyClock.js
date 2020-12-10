/* 
    HUGE thanks to @opsb [user on stackoverflow]
    for the code that powers the svg
    https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle 
*/

import {clockContainer,
        clockInnerCont,
        cbDefault,
        eaElasticDefault } from "../init";
import { centerContainer,
        hours,
        min,
        sec  }             from "../clocks";

var cicHeight,
    galaxyAnim,
    galaxyContainer,
    galaxyIsDrawn,
    galaxyHours,
    galaxyMin,
    galaxySec, 
    galaxyHoursOrbit = {},
    galaxyMinOrbit = {},
    galaxySecOrbit = {};

const galaxyClockHtml =
`<div id="galaxy-container" class="galaxy-margin toscreensave">
    <div id="galaxy-space">
        <div id="galaxy-dot"></div>
        <div id="galaxy-hours" class="orbit-container">
            <span id="galaxy-h-n" class="galaxy-time"></span>
            <svg id="galaxy-h-path" class="galaxy-orbit">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-min" class="orbit-container">
            <span id="galaxy-m-n" class="galaxy-time"></span>
            <svg id="galaxy-m-path" class="galaxy-orbit">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-sec" class="orbit-container">
            <span id="galaxy-s-n" class="galaxy-time"></span>
            <svg id="galaxy-s-path" class="galaxy-orbit">
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
        galaxyContainer = $('#galaxy-container');
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
        direction: 'reverse',
        easing: 'easeOutQuad',
        loop: 3 
    })
        .add({
            opacity: [0.2, 1],
            delay: anime.stagger(250),
            duration: 350,
        })
        .add({
            opacity: [1, 0.2],
            delay: anime.stagger(250),
            duration: 350,
        })

    galaxyAnim.restart();
}

export function skipInit() {
    galaxyIsDrawn = false;
    handleGalaxyClock();
}

export function resetStyle() { }

//Screen Saver actions
export function goFullScreen() {
    $(galaxyContainer).removeClass('galaxy-margin');
    return anime({
        targets: $(galaxyContainer).get(0),
        easing: cbDefault,
        duration: 2000,
        delay: 50,
        scale: () => {
            return (($(window).height() * 0.65) / $(galaxyHours).height());
        },
    });
}

export function leaveFullScreen() {
    $(galaxyContainer).addClass('galaxy-margin');
    return anime({
        targets: $(galaxyContainer).get(0),
        easing: eaElasticDefault,
        duration: 2500,
        scale: 1
    });
}

//

function handleGalaxyClock() {
    const gHours = (hours > 12) ? hours - 12 : hours;
    const h = describeArc(galaxyHoursOrbit.radius, 0, ((gHours * 30)));
    const m = describeArc(galaxyMinOrbit.radius, 0, (min * 6));
    const s = describeArc(galaxySecOrbit.radius, 0, (sec * 6));

    $(galaxyHours).find('path').attr('d', h.d);
    $(galaxyHours).find('#galaxy-h-n')
        .text(hours).css({ 'top': h.y, 'left': h.x })

    $(galaxyMin).find('path').attr('d', m.d);
    $(galaxyMin).find('#galaxy-m-n')
        .text(min).css({ 'top': m.y, 'left': m.x })

    $(galaxySec).find('path').attr('d', s.d);
    $(galaxySec).find('#galaxy-s-n')
        .text(sec).css({ 'top': s.y,'left': s.x })
}

function computeGalaxyClockSize() {
    cicHeight = $(clockContainer).height();
    const ccMargin = parseInt($(clockContainer).css('margin-bottom'));
    const circleDiameter = ((ccMargin) + cicHeight / 2) * 2;

    galaxyHoursOrbit = {
        diameter: circleDiameter,
        radius: (circleDiameter / 2)
    };
    galaxyMinOrbit = {
        diameter: circleDiameter / 1.5,
        radius: (circleDiameter / ( 1.5 * 2)),
    };
    
    galaxySecOrbit = {
        diameter: circleDiameter / 3,
        radius: (circleDiameter / ( 3 * 2)),
    };

    $(galaxyHours).width(galaxyHoursOrbit.diameter).height(galaxyHoursOrbit.diameter);
    $(galaxyMin).width(galaxyMinOrbit.diameter).height(galaxyMinOrbit.diameter);
    $(galaxySec).width(galaxySecOrbit.diameter).height(galaxySecOrbit.diameter);
}

function polarToCartesian(radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: radius + (radius * Math.cos(angleInRadians)),
        y: radius + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(radius, startAngle, endAngle) {

    const start = polarToCartesian(radius, endAngle);
    const end = polarToCartesian(radius, startAngle);

    const largeArcFlag = (endAngle - startAngle <= 180) ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return {
        d: d,
        x: start.x,
        y: start.y,
    };
}