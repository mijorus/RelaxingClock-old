import * as clocks              from "./clocks";
import { disableScreenSaver }   from "./screenSaver";
import { globeInAction }        from "./clockStyles/globeClock";
import { currentPosition }      from "./getSettings";
import { compatibility }        from "./compatibilityDetector";
import { enableScreenSaver }    from "./screenSaver";

export function enableClockListeners() {
    //Clock selection 
    $(clocks.styleSelectorL).on('click', function() {
        if (clocks.clockIsStale()) {
            clocks.changeOption(0);
        }
        disableScreenSaver();
    }); // 0 moves to the left

    $(clocks.styleSelectorR).on('click', function() {
        if (clocks.clockIsStale()) {
            clocks.changeOption(1);
        }
        disableScreenSaver();
    }); // 1 moves to the right

    //Clock selection with arrow keys
    $(window).on('keydown', function(event) {
        const t = 15000
        switch (event.which) {
            case 37:
                if (clocks.clockIsStale() && currentPosition !== 0) {
                    clocks.changeOption(0);
                    enableScreenSaver(t);
                }
            break;
        
            case 39:
                if (clocks.clockIsStale() && currentPosition !== (clocks.options - 1)) {
                    clocks.changeOption(1);
                    enableScreenSaver(t);
                }
            break;
        }
    });

    //Change clock format
    $(clocks.format12).on('click', function() {
        if (clocks.clockIsStale() && !globeInAction) {
            clocks.changeFormat('12h', $(clocks.format12), $(clocks.format24));
        }
    });

    $(clocks.format24).on('click', function() {
        if (clocks.clockIsStale() && !globeInAction) {
            clocks.changeFormat('24h', $(clocks.format24), $(clocks.format12));
        }
    });

    //Handle window resize
    var waitResize;
    $(window).on('resize', function() {
        clearTimeout(waitResize);
        if( !clocks.clockIsResizing && 
            !compatibility.isMobile) {
            clocks.resizeClock(true);
        }

        waitResize = setTimeout(function() {
            (compatibility.isMobile) 
                ? clocks.handleSelectedClock(currentPosition, false, false) 
                : clocks.resizeClock(false)
        }, 1000)
    });
};