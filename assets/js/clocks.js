import moment from 'moment'
import { enableClockListeners } from "./clockListeners";
import { handleMouseCursor, enableScreenSaver, 
    disableScreenSaver, screenSaverIsActive, screenSaverisAnimating } from "./screenSaver";
import { getRandomPlace, aRandomPlace } from '../utils/js/internationalClock/internationalClock';
import { handleLoader } from "../utils/js/utils";
import { clockStyles } from "./clockStyles/styles"

var clockInAction = false,
formatIsAnimating = false,
globeInAction     = false,
clockIsResizing   = false,
clock             = undefined,
localTimezone     = moment.tz.guess(),
remoteUnix        = false;

const optionsName = $('.option-name');

export const ampmIcon = $('#ampm'),
styleList             = 'classic focused metro globe analog',
options               = $(optionsName).length,
format12              = $('#format-12'),
format24              = $('#format-24'),
centerContainer       = $('.center-container'),
styleSelectorL        = $('#style-selector-l'),
styleSelectorR        = $('#style-selector-r'),
ssTimeout             = 5000, //timeout after which the screen saver is engaged
clockOpAnimation      = 350; //timing of the clock opacity animation

//currentPosition = 0; //hardcoded position during development

export default function displayDefaultClock() {
    enableClockListeners();
    handleMouseCursor('watch');
    enableScreenSaver(15000);

    if(clockFormat === '24h') {
        $('#format-12').addClass('unfocus');
        showAMPM(false);
    } else {
        $('#format-24').addClass('unfocus');
        showAMPM(true);
    }

    $(optionsName).filter(`[data-selection=${currentPosition}]`).addClass('selected')
    handleSelectedClock(currentPosition, false, true); //memo for development: change the default clock style
}

export function resizeClock(resizing) {
    const targetEl = clockContainer.get(0);
    anime({
        begin: function() {
            clockIsResizing = true;

            if (!resizing) {
                handleSelectedClock(currentPosition, false, false);
            }
        },
        targets: targetEl,
        opacity: resizing ? 0 : 1,
        easing: 'linear',
        duration: clockOpAnimation / 1.5,
        complete: function() {
            clockIsResizing = false;
        }
    });
}

export function clockIsStale() {
    if (!screenSaverIsActive && 
        !formatIsAnimating && 
        !screenSaverisAnimating &&
        !globeInAction &&
        !clockInAction) {
        return true;
    } else {
        return false;
    }
}

export function changeFormat(selectedFormat, fromFormat, toFormat) { 
    formatIsAnimating = true;
    var firstLoop = true;
    clearTimeout(screenSaverTimeout);
    fromFormat.removeClass('unfocus');
    toFormat.addClass('unfocus');
    anime({
        targets: clockContainer.get(0),
        direction: 'alternate',
        opacity: 0,
        easing: cbDefault,
        duration: clockOpAnimation,
        loopComplete: function() {
            if (firstLoop) {
                clockFormat = selectedFormat;
                if (localStorage) { localStorage.defaultClockFormat = selectedFormat; }
                (selectedFormat === '12h') ? showAMPM(true) : showAMPM (false);
                firstLoop = false;

                loadTime(clockFormat);
                handleSelectedClock(currentPosition, false, false);
            }
        },
        complete: function() {
            formatIsAnimating = false;
        }
    });    
}

function showAMPM(shown) {
    (shown) ? $(ampmIcon).removeClass('disp-none') : $(ampmIcon).addClass('disp-none');
}

export function changeOption (direction) {
    const selectedOption = $(optionsName).filter('.selected');
    currentPosition = $(selectedOption).data('selection');

    var nextPosition, nextSelection;

    switch (direction) {
        case 0:
            $(styleSelectorR).removeClass('overscroll')
            if (currentPosition != 0) {
                nextPosition = currentPosition - 1;
                nextSelection = $(optionsName).filter(`[data-selection=${nextPosition}]`);
                goToNextSelection(nextPosition);
            } else {
                $(styleSelectorL).addClass('overscroll')
            }
        break;
        
        case 1:
            $(styleSelectorL).removeClass('overscroll');
            if (currentPosition !== (options - 1) ) {
                nextPosition = currentPosition + 1;
                nextSelection = $(optionsName).filter(`[data-selection=${nextPosition}]`);
                goToNextSelection(nextPosition);
            } else {
                $(styleSelectorR).addClass('overscroll')
            }
        break;
    }

    function goToNextSelection(nextPosition) {
        $(selectedOption).removeClass('selected');
        $(nextSelection).addClass('selected');
        currentPosition = nextPosition;
        localStorage.defaultPosition = currentPosition;

        handleSelectedClock(currentPosition, true, true);
    }
}

export function handleSelectedClock(userSelection, transition, resetClock) {
    const circleTl = clockStyles.globeClock.circleTl;
    if (circleTl !== undefined) circleTl.pause();

    if (transition && resetClock) {
        const animationProps = {
            targets: clockContainer.get(0),
            duration: clockOpAnimation,
            easing: 'linear',
        }

        switch (userSelection) {
            case 2:
                const metroBg = $('#metro-background');
                $(metroBg).removeClass();
                getRandomPlace(false);
                $(metroBg).addClass(aRandomPlace.city.class);
            break;
            case 4:
                $(cityIcon).removeClass();
                getRandomPlace();
            break;
        }
        
        clockInAction = true;
        clearInterval(clock);
        disableScreenSaver();
        anime({
            ...animationProps,
            opacity: 0,
            complete: function() {
                //remove classes for specific clock styles on style change
                $(bigClock).empty();
                [$(main), $(centerContainer)].forEach((el) => {
                    $(el).removeClass(styleList);
                })
                handleSelection(userSelection);
                handleClockProgression(userSelection);
                anime({
                    ...animationProps,
                    opacity: 1,
                    complete: function() {
                        clockInAction = false;
                    }
                });
            }
        });
    }

    //launches the clock directly, skips the initiation of the interval
    else if (!transition && !resetClock) {
        switch (currentPosition) {
            case 3:
                circleIsdrawn = false;
                clockStyles.handleAnalogClock();
            break;

            case 4:
                handleSelection(userSelection);
                clockStyles.handleGlobeAnimation(false);
            break;

            default:
                handleSelection(userSelection);
            break;
        }
    }

    else if (!transition && resetClock) {
        switch (userSelection) {
            case 2: 
                getRandomPlace(false);
                $('#metro-background').addClass(aRandomPlace.city.class);
            break;
            case 4:
                getRandomPlace();
            break;
        }

        clearInterval(clock);
        handleSelection(userSelection);
        handleClockProgression(userSelection);
    }
}

export function loadTime(timeFormat, zone = localTimezone) { //International or american, called every second 
    let now;
    if (!remoteUnix) {
        now = moment.tz(zone);
    } else {
        now = moment.tz(getAccurateUnix(), "X", zone);
    }

    switch (timeFormat) {
        case '12h':
            hours = now.format('hh');
            if ((now.format('HH') <= 12)) {
                $(ampmIcon).text('AM');
            } else {
                $(ampmIcon).text('PM');
            }
            break;

        case '24h':
            hours = now.format('HH');
            break;
    }

    min = now.format('mm');
    sec = now.format('ss');
}

//This function is called once every second by startClockInterval, just before the handleClockProgression
//and selects the style of the clock
function handleSelection(userSelection) {
    switch (userSelection) {
        case 4:
            loadTime(clockFormat, aRandomPlace.city.tz);
        break;
    
        default:
            loadTime(clockFormat);
        break;
    }

    switch (userSelection) {
        case 0:
            $(centerContainer).addClass('classic');
            clockStyles.handleClassicClock();
        break;
    
        case 1:
            $(centerContainer).addClass('focused');
            clockStyles.handleFocusedClock();
        break;

        case 2:
            $(main).addClass('metro');
            $(centerContainer).addClass('metro');
            clockStyles.handleMetroClock();
        break;
        
        case 3:
            $(centerContainer).addClass('analog')
            clockStyles.handleAnalogClock();
        break;

        case 4:
            clockStyles.handleGlobeClock();
        break;
    }
}

function handleClockProgression(userSelection) {
    console.log(`Clock #${userSelection} is running`);
    switch (currentPosition) {
        case 3:
            clockStyles.randomHandColor();
            handleSelection(userSelection);
        break;

        case 4:
            $(centerContainer).addClass('globe');
            clockStyles.handleGlobeAnimation(true);
        break;
    
    }

    startClockInterval(userSelection);
}

function startClockInterval(userSelection) {
    clock = setInterval(function() {
        handleSelection(userSelection);
    }, 1000);
}

var offset;
export function getRemoteTime(status = true) {
    const rtLoader = $('.remote-time-loader');
    if (status) {
        $(rtLoader.get(0).nextElementSibling).addClass('unavailable');
        handleLoader($(rtLoader), true);
        $.ajax({
            method: "GET", cache: false, url: "https://worldtimeapi.org/api/ip",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .done(function(result) {
                localTimezone = result.timezone;
                offset = moment().unix() - result.unixtime;
                remoteUnix = true;
                setTimeout(function () {
                    handleLoader($(rtLoader), false, true);
                    $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
                }, 1500);
                console.log(`The clock of your pc is ${offset} seconds behind`);
            })
            .fail(function(error) {
                console.error(error);
                setTimeout(function () {
                    handleLoader($(rtLoader), false, false);
                    $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
                }, 1500);
            })
    } else {
        remoteUnix = false;
        handleLoader($(rtLoader), false, false, false);
    }
}

function getAccurateUnix() {
    let accurateUnix = moment().unix() - offset;
    return accurateUnix
}