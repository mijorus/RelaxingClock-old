import { cbDefault, 
        clockInnerCont,
        bigClock }          from "../init";
import { clockFormat,
        currentPosition }   from "../getSettings";
import { format12, 
        format24, 
        loadTime, 
        styleSelectorL,
        styleSelectorR }    from "../clocks";
import { aRandomPlace, 
        newRandomPlace  }   from "../../utils/js/internationalClock/internationalClock";

export const cityName = $('.city-name'), cityIcon = $('#city-icon');
export var globeInAction, circleTl = undefined;

export function handleGlobeClock() {
    $(cityIcon).addClass(aRandomPlace.city.class);
    $(cityName).text(aRandomPlace.city.name);
    if (sec % 2 == 0) {
        $(bigClock).text(hours + ':' + min + ':' + sec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + sec);
    }
}

var circlePathTl,
    halfCirPath,
    bigClockContainer,
    animePath,
    skyIcon,
    clockFormatBtns;

export function handleGlobeAnimation(pathAnimation) {
    if (!halfCirPath) halfCirPath = $('#half-circle-path');
    if (!bigClockContainer) bigClockContainer = $('.big-clock-container');
    if (!clockFormatBtns) clockFormatBtns = [$(format12), $(format24)];

    if (circleTl !== undefined) {
        circleTl.pause();
    }

    halfCircle = computeCircleSize();
    animePath = anime.path(halfCircle.path);
    
    if ($(skyIcon).length) {
        $('#sky-icon').remove();
    }

    createSkyIcon();
    
    if (pathAnimation) {
        animateCirclePath();
    } else {
        halfCirPath.get(0).setAttribute('stroke-dasharray', 10000);
        if (circlePathTl) circlePathTl.pause();
        animateSkyIcon();
    }
}

function animateCirclePath() {
    globeInAction = true;

    circlePathTl = anime.timeline({
        begin: () => {
            for (const el of clockFormatBtns) {
                $(el).addClass('unfocus');
            }
            $(styleSelectorL).addClass('overscroll');
            $(styleSelectorR).addClass('overscroll');
        },
        duration: 3000,
        easing: cbDefault,
        autoplay: false,
        complete: () => {
            globeInAction = false;
            $(styleSelectorL).removeClass('overscroll');
            $(styleSelectorR).removeClass('overscroll');
            (clockFormat === '12h')
                ? $(format12).removeClass('unfocus') 
                : $(format24).removeClass('unfocus');
            
            animateSkyIcon();
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
    skyIcon = $('<span />', {
        id: 'sky-icon',
    }).appendTo($(clockInnerCont));
    var skyIconH = $(skyIcon).height();
    var skyIconW = $(skyIcon).width();
    $(skyIcon).css({
        'bottom': halfCircle.height + 50 - (skyIconH / 2),
        'left': skyIconW / (-2)
    });
}

function animateSkyIcon() {
    const skyIconTime = 1500;
    const cityDay = aRandomPlace.day();

    circleTl = anime.timeline({
        duration: (1000 * 60),
        autoplay: true,
        loop: false,
        begin: () => {
            loadTime(clockFormat, aRandomPlace.city.tz);
            handleGlobeClock();
            if (cityDay.isDay) {
                $(skyIcon).removeClass('moon').addClass('sun');
            } else {
                $(skyIcon).removeClass('sun').addClass('moon');
            }
        },
        complete: () => {
            circleTl.pause()
            if (currentPosition === 4) animateSkyIcon()
        }
    });

    circleTl
        .add({
            targets: $(skyIcon).get(0),
            translateX: animePath('x'),
            translateY: animePath('y'),
            translateZ: 0,
            easing: cityDay.cbCurve(),
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
                loadTime(clockFormat, aRandomPlace.tz);
                handleGlobeClock();
            },
        }, `-=${skyIconTime}`);
}



//Calculates the size of the half circle
function computeCircleSize() {
    const cPathDashed = $('#half-circle-dashed'),
        cicWidth = clockInnerCont.width(),
        cicHeight = clockInnerCont.height();
    const halfCircleRadius = cicWidth / 2;
    const halfCircleSize = `M 0 ${cicHeight} A ${halfCircleRadius} ${halfCircleRadius} 180 0 1 ${cicWidth} ${cicHeight}`;
    $(halfCirPath).attr('d', halfCircleSize);
    $(cPathDashed).attr('d', halfCircleSize);
    return {
        path: $(halfCirPath).get(0),
        width: cicWidth,
        height: cicHeight
    };
}