var settingsSection = $('#settings-section');
var btns = settingsSection.find('button');

setSpotifyLoginButton();
setAutoplayButtons();
setPresentationButtons();
setRemoteTimeButtons();

//Spotify login button
function setSpotifyLoginButton() {
    const logoutBtn = $('#spotify-logout-btn');

    if (localStorage.userHasLogged == 'true') {
        $(logoutBtn).text('Logout');
    } else if (localStorage.userHasLogged == 'false') {
        if (!accessDenied) {
            $(logoutBtn).text('Login'); 
        } else {
            $(logoutBtn).text('Reload'); 
        }
    }
}

//Autoplay buttons
function setAutoplayButtons() {
    if (localStorage.autoplay == 'false') {
        setButtonSelection($(settingsSection).get(0).querySelector('#autoplay-off'));
    } else if (localStorage.autoplay == 'true') {
        setButtonSelection($(settingsSection).get(0).querySelector('#autoplay-on'));

    }
}

//Presentation buttons
function setPresentationButtons() {
    if (localStorage.presentation == 'false') {
        setButtonSelection($(settingsSection).get(0).querySelector('#presentation-off'));
    } else if (localStorage.presentation == 'true') {
        setButtonSelection($(settingsSection).get(0).querySelector('#presentation-on'));
    }
}

function setRemoteTimeButtons() {
    if (localStorage.remoteTime == 'false') {
        setButtonSelection($(settingsSection).get(0).querySelector('#remote-time-off'));
    } else if (localStorage.remoteTime == 'true') {
        getRemoteTime(true);
        setButtonSelection($(settingsSection).get(0).querySelector('#remote-time-on'));
    }
}

//Helper function
function setButtonSelection(target) {
    if (target.dataset.option == 'on') {
        target.classList.add('activated');
        target.nextElementSibling.classList.remove('activated');
    } else if (target.dataset.option == 'off') {
        target.classList.add('activated');
        target.previousElementSibling.classList.remove('activated');
    }
}

//Actions to be executed on button click
for (btn of $(btns)) {
    $(btn).on('click', function(event) {
        //console.log(event);
        event.stopPropagation();
        setButtonSelection(event.target);

        switch (event.target.id) {
            case 'spotify-logout-btn':
                if (localStorage.userHasLogged === 'true') {
                    logout();
                } else if (localStorage.userHasLogged === 'false' && compatibility.login) {
                    if (!accessDenied) {
                        window.location.replace(spotifyURL);
                    } else {
                        logout();
                        window.location.replace(redirectURI);
                    }
                }
            break;

            case 'autoplay-on':
                localStorage.autoplay = 'true';
            break;
            
            case 'autoplay-off':
                localStorage.autoplay = 'false';
            break;

            case 'presentation-on':
                localStorage.presentation = 'true';
                setScreenSaverColors();
            break;

            case 'presentation-off':
                localStorage.presentation = 'false';
                setScreenSaverColors();
            break;

            case 'set-alarm-btn':
                if (!alarm.enabled) {
                    alarm.openPage();
                } else {
                    alarm.dismiss(false);
                }
            break;

            case 'alarm-notif-on':
                if (compatibility.notification) {
                    if (alarm.enabled) {
                        alarm.notifications(true);
                    } 
                }
            break;

            case 'alarm-notif-off':
                if (compatibility.notification) {
                    if (alarm.enabled) {
                        alarm.notifications(false);
                    }
                }
            break;

            case 'remote-time-on':
                getRemoteTime(true);
                localStorage.remoteTime = 'true';
            break;

            case 'remote-time-off':
                getRemoteTime(false);
                localStorage.remoteTime = 'false';
            break;
        }
    });
}