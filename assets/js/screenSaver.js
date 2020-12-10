import { body,
        toScreenSave, 
        main, 
        expandIcon }        from "./init";
import { currentPosition }  from "./getSettings";
import { clockStyles }      from "./clockStyles/styles";
import { inSettings }       from "./settingsPageHandler";

export var screenSaverIsActive = false, //whether or not the screen saver is active
    screenSaverisAnimating     = false; //whether or not the screen saver is animating

var screenSaverTimeout, watchMouse;

export function enableScreenSaver(timeout) {
    disableScreenSaver();
    if (!screenSaverIsActive && timeout >  1) {
        console.log(`Screen saver timeout set to ${timeout}`);
        handleMouseCursor('watch', timeout);
    } else if (!screenSaverIsActive && timeout <= 1) {
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
    screenSaverIsActive = true;
    screenSaverisAnimating = true;
    setScreenSaverColors();
    handleMouseCursor('hide');
    $(toScreenSave).addClass('screen-saving');
    $(window).on('click', function() {
        leaveScreenSaver();
    });

    if (clockStyles[currentPosition].goFullScreen) {
        clockStyles[currentPosition].goFullScreen()
            .finished.then(() => {
                screenSaverisAnimating = false;
            })
    } else {
        setTimeout(() => { 
            screenSaverisAnimating = false 
        }, 1700);
    }
}

function leaveScreenSaver() {
    if (!screenSaverisAnimating) {
        screenSaverIsActive = false;
        screenSaverisAnimating = true;
        $(window).off('click');
        handleMouseCursor('leave');
        $(body).removeClass('screen-saving-color high-contrast');
        $(toScreenSave).removeClass('screen-saving');
        if (clockStyles[currentPosition].leaveFullScreen) {
            clockStyles[currentPosition].leaveFullScreen()
                .finished.then(() => {
                    screenSaverisAnimating = false;
                })
        } else {
            setTimeout(() => { 
                screenSaverisAnimating = false 
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
            $(window).on('mousemove', function() {
                clearTimeout(watchMouse);
                watchMouse = setTimeout(function() {
                    $(window).off('mousemove');
                    enableScreenSaver(1);
                }, timeout)
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

