import { format12, 
        format24, 
        styleSelectorL, 
        styleSelectorR, 
        handleSelectedClock, 
        resizeClock,
        changeFormat } from "./clocks";
import { disableScreenSaver } from "./screenSaver";
import { globeInAction } from "./clockStyles/globeClock";
import { currentPosition } from "./getSettings";
import { compatibility } from "./compatibilityDetector";

export function enableClockListeners() {
    //Clock selection 
    $(styleSelectorL).on('click', function() {
        if (clockIsStale()) {
            changeOption(0);
        }
        disableScreenSaver();
    }); // 0 moves to the left

    $(styleSelectorR).on('click', function() {
        if (clockIsStale()) {
            changeOption(1);
        }
        disableScreenSaver();
    }); // 1 moves to the right

    $(window).on('keydown', function(event) {
        const t = 15000
        switch (event.which) {
            case 37:
                if (clockIsStale() && currentPosition !== 0) {
                    changeOption(0);
                    enableScreenSaver(t);
                }
            break;
        
            case 39:
                if (clockIsStale() && currentPosition !== (options - 1)) {
                    changeOption(1);
                    enableScreenSaver(t);
                }
            break;
        }
    });

    $(format12).on('click', function() {
        if (clockIsStale() && !globeInAction) {
            changeFormat('12h', $(format12), $(format24));
        }
    });

    $(format24).on('click', function() {
        if (clockIsStale() && !globeInAction) {
            changeFormat('24h', $(format24), $(format12));
        }
    });

    var waitResize;
    $(window).on('resize', function() {
        clearTimeout(waitResize);
        
        if(!clockIsResizing && 
            !compatibility.isMobile) {
            resizeClock(true);
        }

        waitResize = setTimeout(function() {
            (compatibility.isMobile) ? handleSelectedClock(currentPosition, false, false) : resizeClock(false)
        }, 1000)
    });
});