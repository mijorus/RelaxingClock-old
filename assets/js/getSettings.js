//User settings
export var clockFormat, currentPosition; 

//Set or get default values from local storage
export function getSettings() {
    if (localStorage) {

        if (localStorage.getItem('defaultPosition') === null) {
            localStorage.setItem('defaultPosition', '0');
        } currentPosition = parseInt(localStorage.defaultPosition);

        if (localStorage.getItem('defaultClockFormat') === null) {
            localStorage.setItem('defaultClockFormat', '24h');
        } clockFormat = localStorage.defaultClockFormat;

        [
            'userHasLogged',
            'autoplay',
            'presentation',
            'longPomodoro',
            'remoteTime',
        ].forEach((value) => {
            if (localStorage.getItem(value) === null) {
                localStorage.setItem(value, 'false');
            }
        });
    }
}

export function setClockFormat(newFormat) {
    clockFormat = newFormat;
    localStorage.defaultClockFormat = newFormat;
}

export function setPosition(newPosition) {
    currentPosition = newPosition;
    localStorage.defaultPosition = newPosition;
}