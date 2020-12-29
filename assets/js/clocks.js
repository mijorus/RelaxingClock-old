//import moment                   from 'moment-timezone';
import { clockContainer,
        main, 
        bigClock, 
        cbDefault }              from "./init";
import { enableClockListeners }  from "./clockListeners";
import * as screenSaver          from './screenSaver'
import { aRandomPlace, newRandomPlace }          from './clockStyles/internationalClock/internationalClock';
import { handleLoader }          from "./utils/utils";
import { remoteTime }            from './remoteTime';
import { clockStyles }           from "./clockStyles/styles";
import { clockFormat, 
        setClockFormat,
        currentPosition,
        setPosition }            from "./getSettings";
import * as newyear from "./clockStyles/newYearAnimation";


var clockInAction = false,
formatIsAnimating = false,
clock             = undefined,
localTimezone     = moment.tz.guess(),
remoteUnix        = false;

const optionsName = $('.option-name');

export var hours, min, sec, clockIsResizing = false;

export const ampmIcon = $('#ampm'),
styleList             = 'classic focused metro globe analog galaxy',
options               = $(optionsName).length,
format12              = $('#format-12'),
format24              = $('#format-24'),
centerContainer       = $('.center-container'),
styleSelectorL        = $('#style-selector-l'),
styleSelectorR        = $('#style-selector-r'),
ssTimeout             = 5000, //timeout after which the screen saver is engaged
clockOpAnimation      = 350; //timing of the clock opacity animation

export function displayDefaultClock() {
    
    enableClockListeners();
    screenSaver.enableScreenSaver(10000);

    if(clockFormat === '24h') {
        $('#format-12').addClass('unfocus');
        showAMPM(false);
    } else {
        $('#format-24').addClass('unfocus');
        showAMPM(true);
    }

    $(optionsName).filter(`[data-selection=${currentPosition}]`).addClass('selected')
    handleSelectedClock(currentPosition, false, true); 
    //memo for development: change the default clock style
}

export function resizeClock(resizing) {
    anime({
        begin: function() {
            clockIsResizing = true;
            if (screenSaver.isActive) screenSaver.leaveScreenSaver();

            if (!resizing) {
                handleSelectedClock(currentPosition, false, false);
            }
        },
        targets: clockContainer.get(0),
        opacity: resizing ? 0 : 1,
        easing: 'linear',
        duration: clockOpAnimation / 1.5,
        complete: function() {
            clockIsResizing = false;
        }
    });
}

export function clockIsStale() {
    if (!screenSaver.isActive && 
        !formatIsAnimating && 
        !screenSaver.isAnimating &&
        !clockStyles[4].globeInAction &&
        !clockInAction) {
        return true;
    } else {
        return false;
    }
}

export function changeFormat(selectedFormat, fromFormat, toFormat) { 
    formatIsAnimating = true;
    var firstLoop = true;
    screenSaver.disableScreenSaver();
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
                setClockFormat(selectedFormat);
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

export function changeOption(direction) {
    const oldPosition = currentPosition;
    const selectedOption = $(optionsName).filter('.selected');
    setPosition($(selectedOption).data('selection')); 

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
        setPosition(nextPosition);
        handleSelectedClock(currentPosition, true, true, oldPosition);
    }
}

export function handleSelectedClock(userSelection, transition, resetClock, oldPosition = undefined) {

    if (oldPosition !== undefined) {
        clockStyles[oldPosition].unloadStyle();
    }

    clockStyles[userSelection].beforeLoad();
    newyear.stopNewYearAnimation();

    if (transition && resetClock) {
        const animationProps = {
            targets: clockContainer.get(0),
            duration: clockOpAnimation,
            easing: 'linear',
        }
        
        clockInAction = true;
        clearInterval(clock);
        screenSaver.disableScreenSaver();
        anime({
            ...animationProps,
            opacity: 0,
            complete: function() {
                //Remove classes for specific clock styles on style change
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

    //Launch the clock directly, skip the initialization of the interval
    else if (!transition && !resetClock) {
        clockStyles[userSelection].skipInit();
        handleSelection(userSelection);
    }

    //Lauch the selected style without any transition animation
    else if (!transition && resetClock) {
        clockStyles[userSelection].resetStyle();

        clearInterval(clock);
        handleSelection(userSelection);
        handleClockProgression(userSelection);
    }
}

//International or american, called every second 
export function loadTime(timeFormat, zone = localTimezone) { 
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

    if (now.dayOfYear() === 1 && now.format('HH:mm') === '00:00' && !newyear.launched) {
        newyear.launchNewYearAnimation();
    }
}

//This function is called once every second by startClockInterval, just before the handleClockProgression
//and selects the style of the clock
function handleSelection(userSelection) {
    switch (userSelection) {
        case 4:
            if (!aRandomPlace.city) newRandomPlace()
            loadTime(clockFormat, aRandomPlace.city.tz);
        break;
    
        default:
            loadTime(clockFormat);
        break;
    }

    clockStyles[userSelection].loadStyle();
}

function handleClockProgression(userSelection) {
    console.log(`Clock #${userSelection} is running`);
    clockStyles[userSelection].startProgression();

    startClockInterval(userSelection);
}

function startClockInterval(userSelection) {
    clock = setInterval(function() {
        handleSelection(userSelection);
    }, 1000);
}

var offset;
export function getRemoteTime(status = true) {
    if (status) {
        remoteTime()
            .done(function(result) {
                remoteUnix =  true;
                localTimezone = result.timezone;
                offset = moment().unix() - result.unixtime;
                console.log(`The clock of your pc is ${offset} seconds behind`);
            })
    } else {
        remoteUnix = false;
        localTimezone = moment.tz.guess();
        handleLoader($('.remote-time-loader'), false, false, false);
    }
}

function getAccurateUnix() {
    return moment().unix() - offset;
}