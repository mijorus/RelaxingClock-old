var settingsSection = $('#settings-section');
var btns = settingsSection.find('button');

setSpotifyLoginButton();
getButtonSettings();

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

function getButtonSettings() {
   [
        {
            stored: localStorage.autoplay,
            button: 'autoplay'
        },
        {
            stored: localStorage.presentation,
            button: 'presentation'
        },
        {
            stored: localStorage.remoteTime,
            button: 'remote-time',
            callback: (localStorage.remoteTime === 'true') ? getRemoteTime(true) : null
        },
        {
            stored: localStorage.longPomodoro,
            button: 'pom-long',
        },
   ].forEach((setting) => {
        console.log(setting);
        const val = (setting.button).toLocaleLowerCase();
        if (setting.stored === 'true') {
            setButtonSelection($(settingsSection).get(0).querySelector(`#${val}-on`), setting.callback);
        } else if (setting.stored === 'false') {
            setButtonSelection($(settingsSection).get(0).querySelector(`#${val}-off`), setting.callback);
        }
   });
}

//Helper function
function setButtonSelection(target, callback) {
    if (target.dataset.option == 'on') {
        target.classList.add('activated');
        target.nextElementSibling.classList.remove('activated');
    } else if (target.dataset.option == 'off') {
        target.classList.add('activated');
        target.previousElementSibling.classList.remove('activated');
    }

    if (callback) callback();
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

            case 'set-pomodoro-btn':
                if (!pomodoro.running) {
                    pomodoro.start();
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