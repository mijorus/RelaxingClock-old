//User settings
export var clockFormat, currentPosition; 

//Set or get default values from local storage
export default function getSettings() {
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