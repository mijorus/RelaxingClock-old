import { body,
        cbDefault, 
        bigClock, 
        toScreenSave, 
        eaElasticDefault, 
        main, 
        clockInnerCont }    from "./init";
import { currentPosition }  from "./getSettings";
import { inSettings }       from "./settingsPageHandler";

export var screenSaverIsActive = false, //whether or not the screen saver is active
    screenSaverisAnimating     = false; //whether or not the screen saver is animating

var screenSaverTimeout;

export function enableScreenSaver(timeout) {
    console.log(`Screen saver timeout set to ${timeout}`);
    clearTimeout(screenSaverTimeout);
    if (!screenSaverIsActive) screenSaverTimeout = setTimeout(() => {setScreenSaver()}, timeout);
}

export function disableScreenSaver() {
    clearTimeout(screenSaverTimeout);
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
    switch (currentPosition) {
        case 2:
            $(clockInnerCont).addClass('metro-margin');
            anime({
                begin: function() {
                },
                targets: $(bigClock).get(0),
                easing: cbDefault,
                duration: 2000,
                delay: 50,
                scale: function(){
                    return (($(window).height() * 0.85) / $(bigClock).height());
                },
                complete: function() {
                    screenSaverisAnimating = false;
                    $(clockInnerCont).removeClass('metro-margin');
                }
            });
            break;
    
        default:
            setTimeout(function() {screenSaverisAnimating = false}, 1700);
            break;
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
        switch (currentPosition) {
            case 2:
                anime({
                    targets: $(bigClock).get(0),
                    scale: [1.8, 1],
                    easing: eaElasticDefault,
                    duration: 2500,
                    complete: function() {
                        screenSaverisAnimating = false;
                        handleMouseCursor('watch');
                    }
                });
                break;
            
            default:
                setTimeout(function() {
                    screenSaverisAnimating = false;
                    handleMouseCursor('watch');
                }, 750);
            break;
        }
    }
}

var cursorTimeout;
export function handleMouseCursor(setState) {     
    switch (setState) {
        case 'watch':
            var watchMouse;
            $(window).on('mousemove', function() {
                clearTimeout(watchMouse);
                watchMouse = setTimeout(function() {
                    enableScreenSaver(1);
                    $(window).off('mousemove');
                }, 15000)
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

