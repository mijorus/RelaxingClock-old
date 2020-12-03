import { cbDefault, clockInnerCont, centerContainer } from "../init";
import { clockFormat } from "../getSettings";
import { format12, format24, loadTime } from "../clocks";
import { aRandomPlace  } from "../../utils/js/internationalClock/internationalClock";

export var globeInAction, circleTl = undefined;

export function handleGlobeClock() {
    $(cityIcon).addClass(aRandomPlace.class);
    $(cityName).text(aRandomPlace.city);
    if (sec % 2 == 0) {
        $(bigClock).text(hours + ':' + min + ':' + sec);
    } else {
        $(bigClock).text(hours + ' ' + min + ' ' + sec);
    }
}
export function handleGlobeAnimation(pathAnimation = true) {
    if (document.readyState === 'complete') {
        globeClockAnimation(pathAnimation);
    } else {
        $(window).on('load', function () {
            $(window).off('load');
            $(centerContainer).addClass('globe');
            globeClockAnimation(pathAnimation)
        });
    }
}

var circlePathTl,
    halfCirPath,
    bigClockContainer,
    animePath,
    clockFormatBtns;

function globeClockAnimation(pathAnimation) {
    halfCirPath = $('#half-circle-path');
    bigClockContainer = $('.big-clock-container');
    clockFormatBtns = [$(format12), $(format24)];

    if (circleTl !== undefined) {
        circleTl.pause();
    }

    const skyIcon = $('#sky-icon');
    if ($(skyIcon).length) {
        $(skyIcon).remove();
    }

    halfCircle = computeCircleSize();
    animePath = anime.path(halfCircle.path);

    if (pathAnimation) {
        animateCirclePath();
    } else {
        halfCirPath.get(0).setAttribute('stroke-dasharray', 10000);
        if (circlePathTl) circlePathTl.pause();
        createSkyIcon();
    }
}

function animateCirclePath() {
    globeInAction = true;

    circlePathTl = anime.timeline({
        begin: function () {
            for (const el of clockFormatBtns) {
                $(el).addClass('unfocus');
            }
            $(styleSelectorL).addClass('overscroll');
            $(styleSelectorR).addClass('overscroll');
        },
        duration: 3000,
        easing: cbDefault,
        autoplay: false,
        complete: function () {
            globeInAction = false;
            $(styleSelectorL).removeClass('overscroll');
            $(styleSelectorR).removeClass('overscroll');
            (clockFormat === '12h') ? $(format12).removeClass('unfocus') : $(format24).removeClass('unfocus');
            createSkyIcon();
        }
    })
        .add({
            targets: $(halfCirPath).get(0),
            strokeDashoffset: [anime.setDashoffset, 0],
            loop: false,
            direction: 'normal',
        });

    circlePathTl.pause().restart();
}

function createSkyIcon() {
    if (!$(skyIcon).length) {
        //use the .length property to check if the element already exists, return false if it doesn't
        $('<span />', {
            id: 'sky-icon',
        }).appendTo(clockInnerCont);
        var skyIconH = $(skyIcon).height();
        var skyIconW = $(skyIcon).width();
        $(skyIcon).css({
            'bottom': halfCircle.height + 50 - (skyIconH / 2),
            'left': skyIconW / (-2)
        });
    }

    animateSkyIcon();
}

function animateSkyIcon() {
    const skyIconTime = 1500;
    circleTl = anime.timeline({
        duration: (1000 * 60),
        autoplay: true,
        loop: false,
        begin: () => {
            loadTime(clockFormat, aRandomPlace.city.tz);
            clockStyles.handleGlobeClock();
            if (isDay) {
                $(skyIcon).removeClass('moon').addClass('sun');
            } else {
                $(skyIcon).removeClass('sun').addClass('moon');
            }
        },
        complete: () => {
            circleTl.pause()
            if (currentPosition === 4) this.animateSkyIcon()
        }
    });

    circleTl
        .add({
            targets: $(skyIcon).get(0),
            translateX: animePath('x'),
            translateY: animePath('y'),
            translateZ: 0,
            easing: aRandomPlace.day.cbCurve,
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
                getRandomPlace();
                loadTime(clockFormat, aRandomPlace.tz);
                clockStyles.handleGlobeClock();
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