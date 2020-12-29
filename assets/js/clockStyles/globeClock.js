import { cbDefault, 
        clockInnerCont,
        bigClock }          from "../init";
import { clockFormat,
        currentPosition }   from "../getSettings";
import { format12, 
        format24, 
        loadTime, 
        centerContainer,
        hours,
        min,
        sec  }              from "../clocks";
import { aRandomPlace, 
        newRandomPlace  }   from "./internationalClock/internationalClock";
import { polarToCartesian }      from "./svgArc/describeArc";

const halfCircleHtml = 
`<div id="globe-path-container">
    <svg id="half-circle" class="toscreensave">
        <path id="half-circle-path" class="half-path" stroke-width="1" stroke-linejoin="round" fill="none" d="" />
        <path id="half-circle-dashed" class="half-path" stroke-width="4" stroke-linejoin="round" fill="none" d="" />
        <path id="half-circle-elapsed" class="half-path" stroke-width="1" stroke="transparent" stroke-linejoin="round" fill="none" d="" />
    </svg>
</div>`

export const cityName = $('.city-name'), cityIcon = $('#city-icon');
export var globeInAction, circleTl = undefined, circlePathTl = undefined;

export function loadStyle() {
    handleGlobeClock();
}

export function beforeLoad() {
    cityIcon.removeClass();

    if (!$('#half-circle').length) {
        $(clockInnerCont).append(halfCircleHtml);
    }
}

export function startProgression() {
    $(centerContainer).addClass('globe');
    handleGlobeAnimation(true);
}

export function unloadStyle() {
    $('#sky-icon').remove();
    if (circleTl) circleTl.pause();
    if (circlePathTl) {
        circlePathTl.pause();
        circlePathTl = undefined;
    }
}

export function skipInit() { 
    handleGlobeAnimation();
}

export function resetStyle() {
    newRandomPlace();
}

//Screen Saver actions
//export function goFullScreen() { }

//export function leaveFullScreen() { }
//

function handleGlobeClock() {
    $(cityIcon).addClass(aRandomPlace.city.class);
    $(cityName).text(aRandomPlace.city.name);
    if (sec % 2 == 0) {
        $(bigClock).text(hours + ':' + min + ':' + sec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + sec);
    }
}

var halfCirPath,
    bigClockContainer,
    animePath,
    skyIcon,
    halfCircle,
    elapsedPath,
    clockFormatBtns;

export function handleGlobeAnimation(pathAnimation) {
    if (!halfCirPath) {
        halfCirPath = $('#half-circle-path');
        elapsedPath = $('#half-circle-elapsed');
        bigClockContainer = $('.big-clock-container');
        clockFormatBtns = [$(format12), $(format24)];
    }

    if (circleTl !== undefined) {
        circleTl.pause();
    }

    halfCircle = computeCircleSize();
    animePath = anime.path(halfCircle.path);
    
    $('#sky-icon').remove();

    createSkyIcon();
    
    if (pathAnimation) {
        animateCirclePath();
    } else {
        halfCirPath.attr('stroke-dasharray', 10000);
        if (circlePathTl) circlePathTl.pause();
        animateSkyIcon();
    }
}

function animateCirclePath() {
    circlePathTl = anime.timeline({
        duration: 3000,
        easing: cbDefault,
        autoplay: false,
        complete: () => {
            if (currentPosition === 4) animateSkyIcon();
        }
    })
        .add({
            targets: $(halfCirPath).get(0),
            strokeDashoffset: [anime.setDashoffset, 0],
            loop: false,
            direction: 'normal',
        });

    circlePathTl.pause();
    circlePathTl.restart();
}

function createSkyIcon() {
    skyIcon = $(`<span id='sky-icon' class="skinny"></span>`).appendTo( $('#globe-path-container') );
    $(skyIcon).css({
        'top': - ( $(skyIcon).height() / 2 ),
        'left': ( $(skyIcon).width() / (-2) ),
    });
}


function animateSkyIcon() {
    const skyIconTime = 750;
    const cityDay = aRandomPlace.day();

    const coord = polarToCartesian(halfCircle.radius, percentageToDegrees(cityDay.percentage))
    $(elapsedPath).attr('d', `M 0 ${halfCircle.radius} A ${halfCircle.radius} ${halfCircle.radius} 180 0 1 ${coord.x} ${coord.y}`);

    const elapsed = anime.path($(elapsedPath).get(0));

    circleTl = anime.timeline({
        duration: (1000 * 60),
        autoplay: true,
        loop: false,
        begin: () => {
            loadTime(clockFormat, aRandomPlace.city.tz);
            handleGlobeClock();
            cityDay.isDay
                ? $(skyIcon).removeClass('moon').addClass('sun')
                : $(skyIcon).removeClass('sun').addClass('moon');
        },
        complete: () => {
            circleTl.pause();
            if (currentPosition === 4) animateSkyIcon();
        }
    })
        .add({
            targets: $(skyIcon).get(0),
            translateX: elapsed('x'),
            translateY: elapsed('y'),
            translateZ: 0,
            easing: 'cubicBezier(.25,.85,.49,.98)',
            opacity: {
                value: [0, 1],
                duration: 500,
                easing: cbDefault,
            },
        }, 0)
        .add({
            targets: [$(bigClockContainer).get(0), $(cityName).get(0), $(skyIcon).get(0)],
            opacity: [1, 0],
            direction: 'alternate',
            easing: 'easeInOutSine',
            duration: skyIconTime,
            loopComplete: function () {
                $(cityIcon).removeClass();
                newRandomPlace();
                loadTime(clockFormat, aRandomPlace.city.tz);
                handleGlobeClock();
            },
        }, `-=${skyIconTime}`);
}



// Calculates the size of the half circle
function computeCircleSize() {
    const cicWidth = clockInnerCont.width();
    const halfCircleRadius = cicWidth / 2;

    $('#globe-path-container').height(halfCircleRadius);
    const halfCircleSize = `M 0 ${halfCircleRadius} A ${halfCircleRadius} ${halfCircleRadius} 180 0 1 ${cicWidth} ${halfCircleRadius}`;
    
    [$(halfCirPath), $('#half-circle-dashed')].forEach((el) => {
        $(el).attr('d', halfCircleSize); });
    return {
        path: $(halfCirPath).get(0),
        radius: halfCircleRadius,
    };
}

function percentageToDegrees(percentage) {
    const degrees = percentage * 1.8;

    return (percentage >= 50) ? degrees - 90 : degrees + 270;
    
}