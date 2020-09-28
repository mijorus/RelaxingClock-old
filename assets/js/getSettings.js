//User settings
var clockFormat, currentPosition; 

//Set or get default values from local storage
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
        'remoteTime'
    ].forEach((value) => {
        if (localStorage.getItem(value) === null) {
            localStorage.setItem(value, 'false');
        }
    });
}