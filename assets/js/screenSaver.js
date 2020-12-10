import { body,
        toScreenSave, 
        main, 
        expandIcon }        from "./init";
import { currentPosition }  from "./getSettings";
import { clockStyles }      from "./clockStyles/styles";
import { inSettings }       from "./settingsPageHandler";

export var isActive = false, //whether or not the screen saver is active
    isAnimating     = false; //whether or not the screen saver is animating

var watchMouse;

export function enableScreenSaver(timeout) {
    disableScreenSaver();
    if (!isActive && timeout >  1) {
        console.log(`Screen saver timeout set to ${timeout}`);
        handleMouseCursor('watch', timeout);
    } else if (!isActive && timeout <= 1) {
        setScreenSaver();
    }
}

export function disableScreenSaver() {
    clearTimeout(watchMouse);
}

export function setScreenSaverColors() {
    if (localStorage.presentation === 'false') {
        $(body).removeClass('high-contrast').addClass('screen-saving-color');
    } else if (localStorage.presentation === 'true') {
        $(body).removeClass('screen-saving-color').addClass('high-contrast');
    }
}

function setScreenSaver() {
    console.log('Starting screen saver');
    isActive = true;
    isAnimating = true;
    setScreenSaverColors();
    handleMouseCursor('hide');
    $(toScreenSave).addClass('screen-saving');
    $(window).on('click', function() {
        leaveScreenSaver();
    });

    if (clockStyles[currentPosition].goFullScreen) {
        clockStyles[currentPosition].goFullScreen()
            .finished.then(() => {
                isAnimating = false;
            })
    } else {
        setTimeout(() => { 
            isAnimating = false 
        }, 1700);
    }
}

export function leaveScreenSaver() {
    if (!isAnimating) {
        isActive = false;
        isAnimating = true;
        $(window).off('click');
        handleMouseCursor('leave');
        $(body).removeClass('screen-saving-color high-contrast');
        $(toScreenSave).removeClass('screen-saving');
        if (clockStyles[currentPosition].leaveFullScreen) {
            clockStyles[currentPosition].leaveFullScreen()
                .finished.then(() => {
                    isAnimating = false;
                })
        } else {
            setTimeout(() => { 
                isAnimating = false 
            }, 750);
        }

        handleMouseCursor('watch')
    }
}

var cursorTimeout;
export function handleMouseCursor(setState, timeout = 15000) {     
    switch (setState) {
        case 'watch':
            console.log('Watching for mouse movements...');
            screenSaverTimeout(timeout);

            $(window).on('mousemove', () => {
                screenSaverTimeout(timeout, true);
            }); 
            break;

        case 'hide':
            if (!inSettings) $(main).css('cursor', 'none');
            $(expandIcon).addClass('hide');
            $(window).on('mousemove', function() {
                $(window).off('mousemove');
                showMouseCursor();
            }); 
            break;
        
        case 'leave':
            clearTimeout(cursorTimeout);
            $(main).css('cursor', 'auto');
            $(expandIcon).removeClass('hide');
            $(window).off('mousemove');
            break;
    }
}

function showMouseCursor() {
    $(main).css('cursor', 'auto');
    $(expandIcon).removeClass('hide');
    $(window).on('mousemove', function() {
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(function() {
            $(window).off('mousemove');  
            handleMouseCursor('hide');               
        }, 2500);
    });
}

function screenSaverTimeout(timeout, mouse = false) {
    clearTimeout(watchMouse);
    watchMouse = setTimeout(() => {
        if (!mouse) console.log('No mouse movement detected');
        $(window).off('mousemove');
        enableScreenSaver(1);
    }, timeout)
}