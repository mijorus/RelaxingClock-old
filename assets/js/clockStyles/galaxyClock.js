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
import { describeArc }     from "./svgArc/describeArc";

var cicHeight,
    galaxyAnim,
    galaxyContainer,
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
            <div id="galaxy-h-n" class="galaxy-time">
                <span class="galaxy-time-n"></span>
            </div>
            <svg id="galaxy-h-path" class="galaxy-orbit">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-min" class="orbit-container">
            <div id="galaxy-m-n" class="galaxy-time">
                <span class="galaxy-time-n"></span>
            </div>
            <svg id="galaxy-m-path" class="galaxy-orbit">
                <path d="" />
            </svg>
        </div>
        <div id="galaxy-sec" class="orbit-container">
            <div id="galaxy-s-n" class="galaxy-time">
                <span class="galaxy-time-n"></span>
            </div>
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
    handleGalaxyClock(true);
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
var oldMin, oldHour;
function handleGalaxyClock(forceRedraw = false) {
    const gHours = (hours > 12) ? hours - 12 : hours;
    [
        {
            el: $(galaxyHours),
            num: hours,
            arc: describeArc(galaxyHoursOrbit.radius, 0, (gHours * 30)),
            old: oldHour,
        },
        {
            el: $(galaxyMin),
            num: min,
            arc: describeArc(galaxyMinOrbit.radius, 0, (min * 6)),
            old: oldMin,
        },
        {
            el: $(galaxySec),
            num: sec,
            arc: describeArc(galaxySecOrbit.radius, 0, (sec * 6)),
        }
    ].forEach((element) => {
        if (element.num !== element.old || forceRedraw) {
            $(element.el).find('path').attr('d', element.arc.d);
            $(element.el).find('.galaxy-time')
                .css({ 'transform': `translate(${element.arc.x}px, ${element.arc.y}px)` })
                    .find('.galaxy-time-n').text(element.num)
        }
    })

    oldHour = hours;
    oldMin = min;
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

