var compatibility = {
    login: false,
    isMobile: false,
    urlEncoding: true,
    notification: false,
    //Credits: https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    firefox: typeof InstallTrigger !== 'undefined',
}

const md = new MobileDetect(window.navigator.userAgent);

if (md.mobile() === null && window.btoa) {
    compatibility.login = true;
}

if (!window.btoa) {
    urlEncoding = false;
}

if (md.mobile() !== null) {
    compatibility.isMobile = true;
}

if ('Notification' in window) {
    compatibility.notification = true;
}
;
const body = $('body'),
bigClock = $('#big-clock'),
expandIcon = $('.expand-icon'),
toScreenSave = $('.toscreensave'),
musicBox = $('#music-box'),
settingsArrow = $('#open-settings-container'),
cbDefault = 'cubicBezier(0.37, 0, 0.63, 1)',
eaElasticDefault = 'easeOutElastic(1, 1)',
clockInnerCont = $('#clock-inner-container'),
clockContainer = $('#clock-container');
var hours,min,sec,
inSettings = false, //if the user is currently in the settings page
logged = false, //if the user has succesfully logged to spotify
settingsIsAnimating = false,
player = {}, paused = true, //the music state
screenSaverIsActive = false, //whether or not the screen saver is active
screenSaverisAnimating = false, //whether or not the screen saver is animating
isFullScreen = false, //whether or not the clock is in fullscreen
logs = true, //whether of not activate logs in the console
clock, //THE Clock
aRandomPlace; //a Random place in the array of cities, is a function;

//Handle Log switch
if (!logs) {
  console.log = function() {}
  console.error = function() {}
}

$('.loader').loaders();

$(expandIcon).on('click', function(event) {
  event.stopPropagation(); //avoid bubbling of the event
  (document.fullscreenElement === null) ? openFullscreen() : closeFullscreen();
});

//Handle settings page button
var settingsPage = {
  openSettings: function(moveDown) {
    settingsIsAnimating = true;
    anime({
      targets: 'html, body',
      duration: 1250,
      scrollTop: (moveDown) ? (($(window).height()) * 0.7) : 0,
      easing: (moveDown) ? eaElasticDefault : 'easeOutExpo',
      complete: function() {
        inSettings = (moveDown) ? true : false;
        settingsIsAnimating = false;
      }
    });
  },

  arrow: function(pointUp) {
    anime({
      targets: $(settingsArrow).get(0),
      duration: 650,
      easing: 'easeOutBack',
      rotate: (pointUp) ? 0 : 180,
      translateX: '-50%',
      complete: function() {
        if (pointUp) {
          $(settingsArrow).find('#open-settings-arrow').removeClass('in-settings');
        } else {
          $(settingsArrow).find('#open-settings-arrow').addClass('in-settings');
        }
      }
    });
  },
}

$(settingsArrow).on('click', function(event) {
  event.stopPropagation();
  if (!inSettings && !settingsIsAnimating) {
    settingsPage.openSettings(true)
  } else if (settingsPage && !settingsIsAnimating) {
    settingsPage.openSettings(false)
  }
});

//Handle window scrolling
let waitScroll;
$(window).on('scroll', function(event) {
  event.stopPropagation()
  clearTimeout(waitScroll);

  waitScroll = setTimeout(function() {
    if ($(window).scrollTop() === 0 ) {
      inSettings = false;
      settingsPage.arrow(true);
      $(musicBox).removeClass('hide');
    } else {
      inSettings = true;
      settingsPage.arrow(false);
      $(musicBox).addClass('hide');
    }
  }, 250)
});


;
//Handle the settings loader animation
function handleLoader(target, show, success = true, enabled = true) {
    ($(target).find('.status-icon')).remove();
    if (enabled) {
        $(target).removeClass('hide');
        const el = $(target).find('.loader');
        if (show) {
            $(el).removeClass('disp-none');
            anime({ targets: $(el).get(0),
                opacity: [0, 1], duration: 200});
        } else {
            anime({targets: $(el).get(0),
                opacity: [1, 0], duration: 200,
                complete: () => $(el).addClass('disp-none')});

            if (success === true) {
                $(target).append('<i class="status-icon icon-checkmark"></i>');
            } else if (success === false) {
                $(target).append('<i class="status-icon icon-cross"></i>');
            }
        }
    } else {
        $(target).addClass('hide');
    }
}

//Get a random song position
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
;
//Handle full screen button
var elem = document.documentElement;
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    }
    $(expandIcon).removeClass('lnr-frame-expand');
    $(expandIcon).addClass('lnr-frame-contract');
    isFullScreen = true;
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    $(expandIcon).removeClass('lnr-frame-contract');
    $(expandIcon).addClass('lnr-frame-expand');
    isFullScreen = false;
}

;
const clientId = 'SPOTIFY_CLIENT_ID';
const redirectURI = '';
const scopes = 'user-read-email,user-read-private,user-read-playback-state,user-modify-playback-state,user-read-currently-playing,user-library-modify,user-library-read,streaming';
var spotifyURL;

async function generateUrl() {
  state = generateRandomString();
  localStorage.setItem('state', state);

  verifier = generateRandomString();
  localStorage.setItem('verifier', verifier);

  challenge = await generateChallenge(verifier);
  localStorage.setItem('state', state);
  spotifyURL  = 'https://accounts.spotify.com/authorize?&client_id=' + encodeURIComponent(clientId);
  spotifyURL += '&response_type=code';
  spotifyURL += '&redirect_uri=' + encodeURIComponent(redirectURI);
  spotifyURL += '&code_challenge_method=S256';
  spotifyURL += '&code_challenge=' + encodeURIComponent(challenge);
  spotifyURL += '&state=' + encodeURIComponent(state);
  spotifyURL += '&scope=' + encodeURIComponent(scopes);
  $('#spotify-link').attr('href', spotifyURL);
}

function generateRandomString() {
  if (window.crypto) {
    var array = new Uint32Array(30);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }
}

function base64urlencode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function escaper(str) {
  return str.replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '')
}

function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

async function generateChallenge(verifier) {
  const hashedVerifier = await sha256(verifier)
  return base64urlencode(hashedVerifier)
}
;
var screenSaverTimeout;

function enableScreenSaver(timeout) {
    console.log(`Screen saver timeout set to ${timeout}`);
    clearTimeout(screenSaverTimeout);
    if (!screenSaverIsActive) screenSaverTimeout = setTimeout(() => {setScreenSaver()}, timeout);
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
                    const clockY = $(bigClock).height();
                    const windowY = $(window).height();
                    return ((windowY * 0.95) / clockY);
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
function handleMouseCursor(setState) {     
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
            if (!inSettings) $(body).css('cursor', 'none');
            $(expandIcon).addClass('hide');
            $(window).on('mousemove', function() {
                $(window).off('mousemove');
                showMouseCursor();
            }); 
            break;
        
        case 'leave':
            clearTimeout(cursorTimeout);
            $(body).css('cursor', 'auto');
            $(expandIcon).removeClass('hide');
            $(window).off('mousemove');
            break;
    }
}

function showMouseCursor() {
    $(body).css('cursor', 'auto');
    $(expandIcon).removeClass('hide');
    $(window).on('mousemove', function() {
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(function() {
            $(window).off('mousemove');  
            handleMouseCursor('hide');               
        }, 2500);
    });
}

function setScreenSaverColors() {
    if (localStorage.presentation === 'false') {
        $(body).removeClass('high-contrast');
        $(body).addClass('screen-saving-color');
    } else if (localStorage.presentation === 'true') {
        $(body).removeClass('screen-saving-color');
        $(body).addClass('high-contrast');
    }
}
;
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
        'alarm-notification', 
        'remoteTime'
    ].forEach((value) => {
        if (localStorage.getItem(value) === null) {
            localStorage.setItem(value, 'false');
        }
    });
}
;
var aRandomPlace = null, isDay, circlePercentage;
//gets a random city from an array
const cities = [
    {
        city : 'Paris',
        tz : 'Europe/Paris',
        lat : 48,
        long : 2,
        class: 'paris'
    },
    {
        city : 'New York',
        tz : 'America/New_York',
        lat : 40,
        long : -74,
        class: 'newyork'
    },
    {
        city : 'Hong Kong',
        tz : 'Asia/Hong_Kong',
        lat : -33,
        long : 151,
        class: 'hongkong'
    },
    {
        city : 'Sydney',
        tz : 'Australia/Sydney',
        lat : -22,
        long : 144,
        class: 'sydney'
    },
    {
        city : 'New Delhi',
        tz : 'Asia/Kolkata',
        lat : 28,
        long : 77,
        class: 'delhi'
    },
    {
        city : 'London',
        tz : 'Europe/London',
        lat : 51,
        long : 0,
        class: 'london'
    },
    {
        city : 'Rome',
        tz : 'Europe/Paris',
        lat : 41,
        long : 12,
        class: 'rome'
    },
    {
        city : 'Beijin',
        tz: 'Asia/Shanghai',
        lat : 39,
        long : 116,
        class: 'beijin'
    },
    {
        city: 'Toronto',
        tz: 'America/Toronto',
        lat: 43,
        long: -79,
        class: 'toronto'
    },
]

const firstCity = (Math.floor(Math.random() * (cities.length)));
var currentCity;
//saves a random place in a variable
function getRandomPlace() {
    if (aRandomPlace === null) {
        aRandomPlace = cities[firstCity];
        currentCity = firstCity;
    } else {
        if (currentCity + 1 >= cities.length) {
            aRandomPlace = cities[0]
            currentCity = 0;
        } else {
            currentCity = currentCity + 1
            aRandomPlace = cities[currentCity];
        }
    }

    console.log(aRandomPlace.city, moment.tz(aRandomPlace.tz).format('HH mm ss'));
    var sunc = SunCalc.getTimes(new Date(), aRandomPlace.lat, aRandomPlace.long);
    var now = moment().valueOf();
    const millsecInDay = moment.duration(24, 'hours').asMilliseconds();

    const sunrise = sunc.sunrise.getTime(),
    sunset = sunc.sunset.getTime();

    console.log(sunc.sunrise, sunc.sunset, now);

    isDay = getDay();

    if (isDay) {
        console.log(`We are at about ${circlePercentage}% of the day in ${aRandomPlace.city}`);
    } else {
        console.log(`We are at about ${circlePercentage}% of the night in ${aRandomPlace.city}`);
    
    }

    function getDay() {

        if (now > sunrise && now >= sunset) {
            circlePercentage = getPercentage(sunset, sunrise + millsecInDay, now)
            return false

        } else if (sunset <= now && sunrise > now) {
            circlePercentage = getPercentage(sunset, sunrise, now);
            return false

        } else if (sunrise >= now && sunset > now) {
            circlePercentage = getPercentage((sunset - millsecInDay), sunrise, now)
            return false

        } else if (sunrise <= now && sunset > now) {
            circlePercentage = getPercentage(sunrise, sunset, now)
            return true
        }
    }
}

function getCbCurve(percentage) {
    var customCB = {
         0: 'cubicBezier(1,.03,.9,.44)',
        10: 'cubicBezier(.24,.3,.88,-0.31)',
        20: 'cubicBezier(.27,.55,.9,-0.27)',
        30: 'cubicBezier(.43,.68,.84,-0.18)',
        40: 'cubicBezier(.39,.85,.84,-0.12)',
        50: 'cubicBezier(0,1,1,0)',
        60: 'cubicBezier(.35,1.08,.92,.22)',
        70: 'cubicBezier(.33,1.2,.84,.28)',
        80: 'cubicBezier(.37,1.24,.88,.43)',
        90: 'cubicBezier(.28,1.3,.82,.67)',
       100: 'cubicBezier(.12,1.12,.74,.93)'
    }
    return customCB[percentage];
}

function getPercentage(zero, hundred, x) {
    // console.log(zero, hundred, x);
    hundred = hundred - zero;
    x = x - zero;
    var h = hundred / 100;
    var result = Math.round((x / h) / 10) * 10;
    return result
}
;
// *** Ajax ***//
var spotify = {
    requestToken: function() {
        $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'authorization_code',
                code: localStorage.code,
                redirect_uri: redirectURI,
                code_verifier: localStorage.verifier
            },
            success: function (response) {
                localStorage.removeItem('code');
                localStorage.removeItem('verifier');
                saveLoginResponse(response);
                spotify.getUserDetails();
            },

            error: function (error) {
                spotify.logError("Can't get token from Spotify", error);
            }
        });
    },

    refreshToken: function() {
        $.ajax({
            method: 'POST',
            url: 'https://accounts.spotify.com/api/token',
            data: {
                client_id: clientId,
                grant_type: 'refresh_token',
                refresh_token: localStorage.refreshToken
            },
            success: function (response) {
                console.log(`Token refreshed`);

                localStorage.removeItem('code');
                saveLoginResponse(response);
                spotify.getUserDetails();
            },

            error: function (error) {
                spotify.logError("Can't refresh token from Spotify", error);
            }
        });
    },

    getUserDetails: function() {
        $.ajax({
            type: "GET", async: true, cache: false, url: "https://api.spotify.com/v1/me", 
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            success: function (response) {
                if (response.product == 'premium') {
                    premium = true;
                    updateStatusText(`Logged in as ${response.id}`)
                    $('#autoplay-box').removeClass('unavailable');
                } else {
                    spotify.throwPremiumError(response.id);
                }
            },
            error: function(error) {
                spotify.logError('CANNOT GET YOUR USERNAME:', error);
            }
        });
    },

    selectSong: function() {
        const playlistURL = '4ZTZhFPPyRzpfHZsWEXAW9';
        $.ajax({
            type: "GET", async: true, cache: false, url: `https://api.spotify.com/v1/playlists/${playlistURL}`,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            success: function(response) {
                const playlistLength = response.tracks.total;
                randomPosition = getRandomIntInclusive(0, playlistLength);
                $(musicBox).addClass('loaded');
                songIsSelected = true;
                randomSong = {
                    'context_uri' : `spotify:playlist:${playlistURL}`,
                    'offset': {
                        'position' : randomPosition
                    }
                }
                
                if (localStorage.autoplay === 'true') {
                    const wait = getRandomIntInclusive(4000, 7500);
                    console.log(`Autoplay is enabled, starting in ${wait / 1000} seconds`);
                    $(spotifyPlaceholder).html('Music will<br>start soon...');
                    setTimeout(function() {
                        if (paused) {
                            handleLoader($('#spotify-loader'), false, null);
                            $(playbackIcon).removeClass('hide');
                            spotify.play(deviceID, randomSong);
                        }
                    }, wait);
                } else if (localStorage.autoplay === 'false') {
                    $(spotifyPlaceholder).html('Ready to<br>play!');
                    handleLoader($('#spotify-loader'), false, null);
                    $(playbackIcon).removeClass('hide');
                }
                
                console.log(`There are ${response.tracks.total} songs in the playlist, I have selected the #${randomPosition}`);
            },
            error: function(error) {
                spotify.logError('CANNOT SELECT A SONG TO PLAY:', error);
            }
        }); 
    },
    
    play: function(device_id, song) {
        console.log(`I am playing on: [Device id:${device_id}]`);
        $.ajax({
            type: "PUT",
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
            data: JSON.stringify(song),
            success: function() {
                console.log('I AM PLAYING!');
                playbackStarted = true;
                $(playbackIcon).removeClass('fa-play');
                $(playbackIcon).addClass('fa-pause');
                setTimeout(function() {
                    spotify.shuffle(true);
                }, 2000);

            },
            error: function(error) {
                spotify.logError('PLAYBACK ERROR!', error);
                switch (error.state) {
                    case 502:
                        $(spotifyPlaceholder).text('Server Error :(');
                    break;
                
                    case 403:
                        if (error.reason === 'PREMIUM_REQUIRED') {
                            spotify.throwPremiumError();
                        } else {
                            spotify.throwGenericError();
                        }
                    break;

                    default:
                        spotify.throwGenericError();
                    break;
                }
            }
        });
    },
    
    shuffle: function(state) {
        $.ajax({
            type: "PUT", async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/player/shuffle?state=${state}&device_id=${deviceID}`,
            success: function() {
                console.log('SHUFFLE IS ENABLED!');
            },
            error: function(error) {
                spotify.logError('ERROR WHILE ENABLING SHUFFLE MODE:', error, false);
            }
        });
    },

    /*The changeState parameter specifies if we have to display only
    the changes on screen or send an ajax requesto to Spotify */
    isLiked: function(song, changeState) {
        $.ajax({
            type: "GET", async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/tracks/contains?ids=${song}`,
            success: function(response) {
                if (response[0]) {
                    favourite = true;
                    console.log('This song is in your library');
                    /*If we only have to change the color of the heart, it calls the func
                    directly, otherwise will execute an ajax request*/
                    (changeState) ? spotify.likeSong(currentTrackId, false) : handleHeartButton(true);
                } else {
                    favourite =  false;
                    console.log('This song is NOT in your library');
                    (changeState) ? spotify.likeSong(currentTrackId, true) : handleHeartButton(false);
                }
            },
            error: function(error) {
                spotify.logError('CANNOT CHECK IF THIS SONG IS ALREADY IN YOUR LIBRARY:', error)
            }
        });
    },

    likeSong: function(song = currentTrackId, toLike = true) {
        $.ajax({
            type: (toLike) ? "PUT" : "DELETE", 
            async: true, cache: false,
            headers: {
                'Authorization': `Bearer ${sessionStorage.accessToken}`
            },
            url: `https://api.spotify.com/v1/me/tracks?ids=${song}`,
            success: function () {
                if (toLike) {
                    console.log('ADDED TO FAV!');
                    handleHeartButton(true);
                } else {
                    console.log('REMOVED FROM FAV!');
                    handleHeartButton(false);
                }
            },
            error: function (error) {
                if (toLike) {
                    spotify.logError('CANNOT ADD TO FAV:', error, false);
                } else {
                    spotify.logError('CANNOT REMOVE FROM FAV:', error, false);
                }
            }
        });
    },

    logError: function(message, error, throwError = true) {
        console.error(message + ' ' + error.responseJSON.error.message);
        if (throwError) this.throwGenericError();
    },

    throwGenericError: function() {
        player.pause();
        $('#spotify-track-info').hide();
        $(spotifyPlaceholder).css('opacity', 1);
        $(spotifyPlaceholder).html(
            `Something went<br>wrong :( <a href="${redirectURI}">Try again</a>`
        );
    },

    throwPremiumError: function (username) {
        localStorage.setItem('premium', 'false');
        updateStatusText(`Sorry ${username}, but you need a premium account`);
        $(spotifyPlaceholder).text(`Sorry, you must be a premium user :(`);
    }
}

function saveLoginResponse(response) {
    logged = true;
    console.log(`Saving data...`);

    const expires_at = moment().unix() + (parseInt(response.expires_in));

    sessionStorage.setItem('expires_at', expires_at);
    sessionStorage.setItem('accessToken', response.access_token);
    localStorage.setItem('refreshToken', response.refresh_token);

   const loginCompleted = new Event('loginCompleted');
   document.dispatchEvent(loginCompleted);
}
;
var handColor, circleIsdrawn = false, circlePathTl;
const cityName = $('.city-name'), cityIcon = $('#city-icon');
var clockStyles = {
    //0
    handleClassicClock: function() {
        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min + ':' + sec);
        } else {
            $(bigClock).text(hours + ' ' + min + ' ' + sec);
        }
    },
    //1
    handleFocusedClock: function() {
        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min);
        } else {
            $(bigClock).text(hours + ' ' + min);
        }
    },
    //2
    handleMetroClock: function() {
        if (sec % 2 == 0) {
            $(bigClock).html(hours + '<br>' + '·' + '<br>' + min);
        } else {
            $(bigClock).html(hours + '<br>' + ' ' + '<br>' + min);
        }
    },
    
    //3
    handleAnalogClock: function() {
        var handhours = $('#hand-hours');
        var handmin = $('#hand-min');
        var handsec = $('#hand-seconds');
        
        if (!circleIsdrawn) {
            if (document.readyState === 'complete') {
                computeAnalogSize();
            } else {
                $(window).on('load', function() {
                    computeAnalogSize();
                });
            }
        } else {
            fullHandMovement();
        }
        
        async function computeAnalogSize() {
            $(window).off('load');
            var ccMargin = parseInt($(clockContainer).css('margin-bottom'))
            var cicHeight = $(clockContainer).height();
            var circle = $('#circle');
            var circleRadius = ((ccMargin) + cicHeight / 2);
            var circleDiameter = circleRadius * 2;
            $(circle).width(circleDiameter);
            $(circle).height(circleDiameter);
            
            $(handsec).height((circleRadius * 80) / 100);
            $(handmin).height((circleRadius * 60) / 100);
            $(handhours).height((circleRadius * 40) / 100);
            
            circleIsdrawn = true;
            
            fullHandMovement();
        }
        
        function fullHandMovement() {
            $(handhours).css('transform', `translate(-50%, -100%) rotate(${(hours * 30) + (min / 2)}deg)`);
            $(handmin).css('transform', `translate(-50%, -100%) rotate(${(min * 6) + (sec / 10)}deg)`);
            $(handsec).css({
                'transform': `translate(-50%, -100%) rotate(${sec * 6}deg)`,
                'background-color': handColor
            });
        }
    },

    randomHandColor: function() {
        handColor = randomColor({luminosity: 'light'});
    },

    //4
    handleGlobeClock: function() {
        $(cityIcon).addClass(aRandomPlace.class);
        $(cityName).text(aRandomPlace.city);
        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min + ':' + sec);
        } else {
            $(bigClock).text(hours + ' ' + min + ' ' + sec);
        }
    },

    handleGlobeAnimation: function(pathAnimation = true) {
        if (document.readyState === 'complete') {
            globeClockAnimation();
        } else {
            $(window).on('load', function() {
                $(centerContainer).addClass('globe');
                globeClockAnimation()
            });
        }
        
        async function globeClockAnimation() {
            const halfCirPath = $('#half-circle-path'),
            bigClockContainer = $('.big-clock-container'),
            clockFormatBtns = [$(format12), $(format24)];
            if (circleTl !== undefined) {
                circleTl.pause();
            }
            
            var circlePath = {
                animateCirclePath: function() {
                    globeInAction = true;
                    
                    
                    circlePathTl = anime.timeline({
                        duration: 3000,
                        easing: cbDefault,
                        autoplay: false,
                    });
                    
                    circlePathTl.add({
                        begin: function() {
                            for (const el of clockFormatBtns) {
                                $(el).addClass('unfocus');
                            }
                            $(styleSelectorL).addClass('overscroll');
                            $(styleSelectorR).addClass('overscroll');
                        },
                        targets: $(halfCirPath).get(0),
                        strokeDashoffset: [anime.setDashoffset, 0],
                        easing: cbDefault,
                        duration: 3000,
                        loop: false,
                        direction: 'normal',
                        complete: function() {
                            globeInAction = false;
                            $(styleSelectorL).removeClass('overscroll');
                            $(styleSelectorR).removeClass('overscroll');
                            (clockFormat === '12h') ? $(format12).removeClass('unfocus') : $(format24).removeClass('unfocus');
                            circlePath.createSkyIcon();
                        }
                    });
                    
                    circlePathTl.pause();
                    circlePathTl.restart();
                },
                
                createSkyIcon: function() {
                    if (!$(skyIcon).length) {
                        //use the .length property to check if the element already exists, return false if it doesn't
                        $('<span />', {
                            id: 'sky-icon',
                        }).appendTo(clockInnerCont);
                        var skyIconH = $(skyIcon).height();
                        var skyIconW = $(skyIcon).width();
                        $(skyIcon).css({
                            'bottom': halfCircle.height + 50 - (skyIconH / 2),
                            'left': skyIconW / (-2)
                        });
                    } 
                    
                    $(skyIcon).addClass(function() {
                        return (isDay) ? 'sun' : 'moon'; 
                    });
                    circlePath.animateSkyIcon();
                },
                
                animateSkyIcon: function() {
                    loadTime(clockFormat, aRandomPlace.tz);
                    clockStyles.handleGlobeClock();
                    if (isDay) {
                        $(skyIcon).removeClass('moon');
                        $(skyIcon).addClass('sun');
                    } else {
                        $(skyIcon).removeClass('sun');
                        $(skyIcon).addClass('moon');
                    }

                    let skyItime = 1500;
                    circleTl = anime.timeline({
                        duration: (1000 * 60),
                        autoplay: true,
                        loop: false
                    });
                    circleTl.add({
                        targets: $(skyIcon).get(0),
                        translateX: animePath('x'),
                        translateY: animePath('y'),
                        translateZ: 0,
                        rotate: (compatibility.firefox) ? [0.02, 0.02] : 0,
                        rotateZ: 0,
                        easing: getCbCurve(circlePercentage),
                        opacity: {
                            value: [0, 1],
                            duration: 500,
                            easing: cbDefault,
                        },
                        loop: false,
                    }, 0)
                    .add({
                        begin: function () { globeInAction = true},
                        targets: [$(bigClockContainer).get(0), $(cityName).get(0), $(skyIcon).get(0)],
                        opacity: [1, 0,],
                        direction: 'alternate',
                        easing: 'easeInOutSine',
                        duration: skyItime,
                        loopComplete: function() {
                            $(cityIcon).removeClass();
                            getRandomPlace();
                            loadTime(clockFormat, aRandomPlace.tz);
                            clockStyles.handleGlobeClock();
                        },
                        complete: function() {
                            globeInAction = false;
                            circlePath.animateSkyIcon();
                        }
                    }, `-=${skyItime}`);
                    circleTl.restart();
                }
            }
            
            $(window).off('load');
            var skyIcon = '#sky-icon';
            if ($(skyIcon).length) {
                $('#sky-icon').remove();
            }
            
            halfCircle = await computeCircleSize();
            const animePath = anime.path(halfCircle.path);
            
            if(pathAnimation) {
                circlePath.animateCirclePath();
            } else {
                halfCirPath.get(0).setAttribute('stroke-dasharray', 10000);
                circlePath.createSkyIcon();
            }
            
            //Calculates the size of the half circle
            async function computeCircleSize() {
                const cPathDashed = $('#half-circle-dashed'),
                cicWidth = clockInnerCont.width(),
                cicHeight = clockInnerCont.height();
                var halfCircleRadius = cicWidth / 2;
                var halfCircleSize = `M 0 ${cicHeight} A ${halfCircleRadius} ${halfCircleRadius} 180 0 1 ${cicWidth} ${cicHeight}`;
                $(halfCirPath).attr('d', halfCircleSize);
                $(cPathDashed).attr('d', halfCircleSize);
                return {
                    path : $(halfCirPath).get(0),
                    width : cicWidth,
                    height : cicHeight
                };
            }
        }
    },
}
;
var clockInAction = false,
formatIsAnimating = false,
globeInAction = false,
optionsName = $('.option-name'),
clockIsResizing = false,
localTimezone = moment.tz.guess(),
remoteUnix = false,
circleTl;
const ampmIcon = $('#ampm'),
styleList = 'classic focused metro globe analog',
format12 = $('#format-12'),
format24 = $('#format-24'),
options = $(optionsName).length,
centerContainer = $('.center-container'),
styleSelectorL = $('#style-selector-l'),
styleSelectorR = $('#style-selector-r'),
ssTimeout = 5000, //timeout after which the screen saver is engaged
clockOpAnimation = 350 //timing of the clock opacity animation
;

//currentPosition = 0; //hardcoded position during development
displayDefaultClock();
handleMouseCursor('watch');

function displayDefaultClock() {
    enableScreenSaver(15000);
    if(clockFormat === '24h') {
        $('#format-12').addClass('unfocus');
        showAMPM(false);
    } else {
        $('#format-24').addClass('unfocus');
        showAMPM(true);
    }

    $(optionsName).filter(`[data-selection=${currentPosition}]`).addClass('selected')
    handleSelectedClock(currentPosition, false, true); //memo for development: change the default clock style
}

function resizeClock(resizing) {
    const targetEl = clockContainer.get(0);
    anime({
        begin: function() {
            clockIsResizing = true;

            if (!resizing) {
                handleSelectedClock(currentPosition, false, false);
            }
        },
        targets: targetEl,
        update: function(anim){
            if (resizing) {
                targetEl.style.filter = `blur(${20 * anim.progress / 100}px)`
            } else {
                targetEl.style.filter = `blur(${20 - (20 * anim.progress / 100)}px)`
            }    
        },
        easing: 'linear',
        duration: clockOpAnimation,
        complete: function() {
            clockIsResizing = false;
        }
    });
}

function clockIsStale() {
    if (!screenSaverIsActive && 
        !formatIsAnimating && 
        !screenSaverisAnimating &&
        !globeInAction &&
        !clockInAction) {
        return true;
    } else {
        return false;
    }
}

function changeFormat(selectedFormat, fromFormat, toFormat) { 
    formatIsAnimating = true;
    var firstLoop = true;
    clearTimeout(screenSaverTimeout);
    fromFormat.removeClass('unfocus');
    toFormat.addClass('unfocus');
    anime({
        targets: clockContainer.get(0),
        direction: 'alternate',
        opacity: 0,
        easing: cbDefault,
        duration: clockOpAnimation,
        loopComplete: function() {
            if (firstLoop) {
                clockFormat = selectedFormat;
                if (localStorage) { localStorage.defaultClockFormat = selectedFormat; }
                (selectedFormat === '12h') ? showAMPM(true) : showAMPM (false);
                firstLoop = false;

                loadTime(clockFormat);
                handleSelectedClock(currentPosition, false, false);
            }
        },
        complete: function() {
            formatIsAnimating = false;
        }
    });    
}

function showAMPM(shown) {
    (shown) ? $(ampmIcon).removeClass('disp-none') : $(ampmIcon).addClass('disp-none');
}

function changeOption (direction) {
    var selectedOption = $(optionsName).filter('.selected');
    currentPosition = $(selectedOption).data('selection');
    switch (direction) {
        case 0:
            $(styleSelectorR).removeClass('overscroll')
            if (currentPosition != 0) {
                var nextPosition = currentPosition - 1;
                var nextSelection = $(optionsName).filter(`[data-selection=${nextPosition}]`);
                goToNextSelection(nextPosition);
            } else {
                $(styleSelectorL).addClass('overscroll')
            }
        break;
        
        case 1:
            $(styleSelectorL).removeClass('overscroll');
            if (currentPosition !== (options - 1) ) {
                var nextPosition = currentPosition + 1;
                var nextSelection = $(optionsName).filter(`[data-selection=${nextPosition}]`);
                goToNextSelection(nextPosition);
            } else {
                $(styleSelectorR).addClass('overscroll')
            }
        break;
    }

    function goToNextSelection(nextPosition) {
        $(selectedOption).removeClass('selected');
        $(nextSelection).addClass('selected');
        currentPosition = nextPosition;
        if (localStorage) { localStorage.defaultPosition = currentPosition; }

        handleSelectedClock(currentPosition, true, true);
    }
}

function loadTime(timeFormat, zone = localTimezone) { //International or american, called every second 
    let now;
        if (!remoteUnix) {
            now = moment.tz(zone);
        } else {
            now = moment.tz(getAccurateUnix(), "X", zone);
        }

    switch (timeFormat) {
        case '12h':
            hours   = now.format('hh');
            min     = now.format('mm');

            if (currentPosition === 0 && hours == '04' && min == '20' && now.format('HH') > 12) {
                sec = '69';
            } else {
                sec = now.format('ss');
            }

            if ((now.format('HH') <= 12)) {
                $(ampmIcon).text('AM');
            } else {
                $(ampmIcon).text('PM');
            }
        break;
    
        case '24h':
            hours   = now.format('HH');
            min     = now.format('mm');
            sec     = now.format('ss'); 
        break;

    }
}

function handleSelectedClock(userSelection, transition, resetClock) {
    (circleTl !== undefined) ? circleTl.pause() : null;

    if  (transition && resetClock) {
        switch (userSelection) {
            case 4:
                $(cityIcon).removeClass();
                getRandomPlace();
            break;
        }
        
        clockInAction = true;
        clearInterval(clock);
        clearTimeout(screenSaverTimeout);
        anime({
            targets: clockContainer.get(0),
            duration: clockOpAnimation,
            easing: 'linear',
            opacity: 0,
            complete: function() {
                //remove classes for specific clock styles on style change
                $(bigClock).empty();
                $(centerContainer).removeClass(styleList);
                handleSelection(userSelection);
                handleClockProgression(userSelection);
                anime({
                    targets: clockContainer.get(0),
                    duration: clockOpAnimation,
                    easing: 'linear',
                    opacity: 1,
                    complete: function() {
                        clockInAction = false;
                    }
                });
            }
        });
    }

    //launches the clock directly, skips the initiation of the interval
    else if (!transition && !resetClock) {
        switch (currentPosition) {
            case 3:
                circleIsdrawn = false;
                clockStyles.handleAnalogClock();
            break;

            case 4:
                handleSelection(userSelection);
                clockStyles.handleGlobeAnimation(false);
            break;

            default:
                handleSelection(userSelection);
            break;
        }
    }

    else if (!transition && resetClock) {
        switch (userSelection) {
            case 4:
                getRandomPlace()
            break;
        }

        clearInterval(clock);
        handleSelection(userSelection);
        handleClockProgression(userSelection);
    }
}

//this function is called once every second by startClockInterval, just before the handleClockProgression
//and selects the style of the clock
function handleSelection(userSelection) {
    
    switch (userSelection) {
        case 4:
            loadTime(clockFormat, aRandomPlace.tz);
        break;
    
        default:
            loadTime(clockFormat);
        break;
    }

    switch (userSelection) {
        case 0:
            $(centerContainer).addClass('classic');
            clockStyles.handleClassicClock();
        break;
    
        case 1:
            $(centerContainer).addClass('focused');
            clockStyles.handleFocusedClock();
        break;

        case 2:
            $(centerContainer).addClass('metro');
            clockStyles.handleMetroClock();
        break;
        
        case 3:
            $(centerContainer).addClass('analog')
            clockStyles.handleAnalogClock();
        break;

        case 4:
            clockStyles.handleGlobeClock();
        break;
    }
}

function handleClockProgression(userSelection) {
    console.log(`Clock #${userSelection} is running`);
    switch (currentPosition) {
        case 3:
            clockStyles.randomHandColor();
            handleSelection(userSelection);
        break;

        case 4:
            $(centerContainer).addClass('globe');
            clockStyles.handleGlobeAnimation(true);
        break;
    
    }

    startClockInterval(userSelection);
}

function startClockInterval(userSelection) {
    clock = setInterval(function() {
        handleSelection(userSelection);
    }, 1000);
}

var offset;
function getRemoteTime(status = true) {
    const rtLoader = $('.remote-time-loader');
    if (status) {
        $(rtLoader.get(0).nextElementSibling).addClass('unavailable');
        handleLoader($(rtLoader), true);
        $.ajax({
            method: "GET", cache: false, url: "https://worldtimeapi.org/api/ip",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function(result) {
                localTimezone = result.timezone;
                offset = moment().unix() - result.unixtime;
                remoteUnix = true;
                setTimeout(function () {
                    handleLoader($(rtLoader), false, true);
                    $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
                }, 1500);
                console.log(`The clock of your pc is ${offset} seconds behind`);
            },
            error: function(error) {
                console.error(error);
                setTimeout(function () {
                    handleLoader($(rtLoader), false, false);
                    $(rtLoader.get(0).nextElementSibling).removeClass('unavailable');
                }, 1500);
            }
        });
    } else {
        remoteUnix = false;
        handleLoader($(rtLoader), false, false, false);
    }
}

function getAccurateUnix() {
    let accurateUnix = moment().unix() - offset;
    return accurateUnix
}
;
const arrows = $('#alarm-big-clock').find('.arrow'),
    alarmSection = $('#alarm-section');
var alarmTime, ringTl;

var alarm = {
    
    at: undefined,

    enabled: false,

    notificationStatus: false,

    notifications: function(enabled) {
        const perm = Notification.permission

        if (enabled) {
            if (perm === 'granted') {
                this.notificationStatus = true;
            } else if (perm !== 'denied' || perm === "default") {
                Notification.requestPermission()
                .then(function (result) {
                    if (result === 'granted') {
                        this.notificationStatus = true;
                    }
                })
            }
        } else {
            this.notificationStatus = false;
        }
    },

    init: function() {
        this.ampmAlarm = $('#am-pm-alarm');
        this.alarmH = $('#alarm-h').find('span');
        this.alarmM = $('#alarm-m').find('span');
        this.alarmSet = $('#alarm-set span');
        this.alarmDismiss = $('#alarm-dismiss span');
        this.tomorrowBox = $('#tomorrow-alarm');
        this.alarmLable = $('#alarm-lable');
    },

    openPage: function () {
        this.init();
        inSettings = true;
        alarmTime = moment().second(0).add(1, 'm');
        this.updateTime();

        [$(this.alarmH), $(this.alarmM)].forEach((el) => {
            $(el).get(0).addEventListener(
                'wheel', handleAlarmWheel, { passive: true }
            );
        });

        $(arrows).each(function (index, el) {
            $(el).on('click', function (event) {
                event.stopPropagation();
                handleArrows($(el));
            });
        });

        $(this.alarmSet).on('click', () => { this.set(alarmTime) });
        $(this.alarmDismiss).on('click', () => { this.closePage() });

        (clockFormat === '24h') ? $(this.ampmAlarm).addClass('hide') : $(this.ampmAlarm).removeClass('hide');
        $(body).addClass('unscrollable');
        $('#big-container').addClass('blur');
        anime({
            begin: () => { $(alarmSection).addClass('show') },
            targets: $(alarmSection).get(0),
            duration: 350,
            easing: cbDefault,
            opacity: [0, 1],
        })
    },

    timeToAlarm: function() {
        const timeLeft = alarmTime.calendar({
            sameDay: `[in ${alarmTime.toNow('mm')}]`,
            nextDay: '[Tomorrow]',
        });
        return timeLeft
    },

    set: function (when) {
        console.log(`Alarm set at ${when.format('HH:mm')}`);
        
        alarm.enabled = true;
        $('#set-alarm-btn').addClass('btn-dismiss');
        if (compatibility.notification && (Notification.permission !== 'denied')) {
            $('#alarm-notif-box').removeClass('unavailable');
        }
            

        anime({
            targets: $(alarm.alarmLable).get(0),
            direction: 'alternate', duration: 650, loop: 1, easing: cbDefault, opacity: [1, 0],
            loopComplete: () => {
                $(alarm.alarmLable).text(`Rings ${this.timeToAlarm().toLowerCase()}`);
            }
        });

        this.at = setInterval(function () {
            if (moment().isSameOrAfter(when)) {
                console.log('RING! RING! RING!');

                alarm.ring(true);
                alarm.enabled = false;
                clearInterval(alarm.at);
            }

            const left = alarm.timeToAlarm().toLowerCase();
            if (alarm.alarmLable.text() !== `Rings ${left}` && alarm.enabled) {               
                $(alarm.alarmLable).text(`Rings ${left}`)
            }

        }, 1000);

       
        this.closePage();
    },

    dismiss: function () {
        console.log('Dismissed alarm!');

        this.ring(false);
        this.closePage();
        clearInterval(this.at);
        this.enabled = false;
        $('#set-alarm-btn').removeClass('btn-dismiss');
        $('#alarm-notif-box').addClass('unavailable');

        anime({
            targets: $(alarm.alarmLable).get(0),
            direction: 'alternate', duration: 650, loop: 1, easing: cbDefault, opacity: [1, 0],
            loopComplete: () => {
                $(this.alarmLable).text(`Set an alarm`);
            }
        });
    },

    snooze: function () {
        console.log('Snoozed alarm!');

        this.ring(false);
        this.set(alarmTime.add(10, 'm'));
    },

    ring: function (ringing = true) {
        let bgone, bgtwo;

        if (ringing) {
            $(alarmSection).addClass('ring');
            $('#big-container').addClass('blur');
            $(alarmSection).removeClass('show');

            anime({
                targets: $(alarmSection).get(0),
                duration: 100,
                easing: cbDefault,
                opacity: [0, 1],
            });

            bgone = randomColor({ luminosity: 'light', format: 'rgba', alpha: 0.9 });
            bgtwo = randomColor({ luminosity: 'light', format: 'rgba', alpha: 0.9 });
        }

        const tl = { duration: 350, easing: 'linear', autoplay: false, loop: false };

        ringTl = anime.timeline(tl);
        const ringTll = anime.timeline(tl);

        ringTl.add({
            update: function (percent) {
                $(alarmSection).get(0).style.background = `radial-gradient(circle, ${bgone} ${(percent.progress) / 2}%, ${bgtwo} ${(percent.progress) * 2}%)`
            },
            complete: function () {
                ringTll.restart()
            }
        }, 0)

        ringTll.add({
            update: function (percent) {
                $(alarmSection).get(0).style.background = `radial-gradient(circle, ${bgtwo}  ${(percent.progress)}%, ${bgone} ${(percent.progress) * 2}%)`
            },
            complete: function () {
                setTimeout(function () {
                    if (ringing) ringTl.restart();
                }, 250)
            }
        }, 0);

        visibilityCheck()
        function visibilityCheck() {
            if (document.visibilityState === 'visible') {
                $(document).off('visibilitychange');
                (ringing) ? ringTl.restart() : ringTl.pause();
            } else {
                const alarmFormat = (clockFormat === '24h') ? alarmTime.format('HH:mm') : alarmTime.format('hh:mm');
                const alarmNotif = new Notification(`IT'S ${alarmFormat} WAKE UP!!!`, {
                    lang: 'EN',
                    body: 'The alarm is ringing',
                    requireInteraction: true,
                    icon: `${redirectURI}/static/img/clock.png`

                });
                $(document).on('visibilitychange',() => visibilityCheck());
            }
        }

        $(this.alarmSet).on('click', (event) => { event.stopPropagation(); this.snooze() });
        $(this.alarmDismiss).on('click', (event) => { event.stopPropagation(); this.dismiss() });
    },

    closePage: function () {
        $(this.tomorrowBox).empty();
        this.removeAlarmListeners();
        $(body).removeClass('unscrollable');
        $('#big-container').removeClass('blur');

        anime({
            targets: $(alarmSection).get(0),
            duration: 350,
            easing: cbDefault,
            opacity: [1, 0],
            complete: () => { $(alarmSection).removeClass('show ring') }
        })
    },

    updateTime: function () {
        if (clockFormat === '24h') {
            $(this.alarmH).empty().append(alarmTime.format('HH'));
        } else if (clockFormat === '12h') {
            $(this.alarmH).empty().append(alarmTime.format('hh'));

            if ((alarmTime.format('HH') <= 12)) {
                $(this.ampmAlarm).text('AM');
            } else {
                $(this.ampmAlarm).text('PM');
            }
        }

        $(this.alarmM).empty().text(alarmTime.format('mm'));
        $(this.tomorrowBox).empty().text(this.timeToAlarm());
    },

    removeAlarmListeners: function() {
        $(arrows).each((index, el) => { $(el).off('click') });
        [$(alarm.alarmSet), $(alarm.alarmDismiss)].forEach((el) => $(el).off('click'));

        [$(this.alarmH), $(this.alarmM)].forEach((el) => {
            $(el).get(0).removeEventListener(
                'wheel', handleAlarmWheel, { passive: true }
            );
        });
    } 
}

function handleArrows(el) {
    switch ($(el).data('action')) {
        case 'h-up':
            alarmTime.add(1, 'h');
            break;

        case 'h-down':
            checkSubt('h');
            break;

        case 'm-up':
            alarmTime.add(1, 'm');
            break;

        case 'm-down':
            checkSubt('m');
            break;
    }

    if (alarmTime.isSameOrAfter(moment())) alarm.updateTime();
}

function handleAlarmWheel(event) {
    if (event.target.id === 'al-m') {
        if (event.deltaY < 0) {
            alarmTime.add(1, 'm');
        } else {
            checkSubt('m');
        }
    } else if (event.target.id === 'al-h') {
        if (event.deltaY < 0) {
            alarmTime.add(1, 'h');
        } else {
            checkSubt('h');
        }
    }

    if (alarmTime.isSameOrAfter(moment())) alarm.updateTime();
}

//Alarms must be always in the future. This func
//checks if a time substraction is possible; if so, subtracts!
function checkSubt(time) {
    if (time === 'm') {
        if (moment().add(1, 'm').isSameOrBefore(alarmTime)) {
            alarmTime.subtract(1, 'm');
        }
    } else if (time === 'h') {
        if (moment().add(1, 'h').isSameOrBefore(alarmTime)) {
            alarmTime.subtract(1, 'h');
        }
    }
}
;
function handleHeartButton(songIsLiked) {
    if (songIsLiked) {
        $(likeBtn).children('#like-icon').removeClass('far');
        $(likeBtn).children('#like-icon').addClass('fas');
    } else {
        $(likeBtn).children('#like-icon').removeClass('fas');
        $(likeBtn).children('#like-icon').addClass('far');  
    }
}

function updateStatusText (message) {
    const spotifyStatusText = '#spotify-status-text';
    $(spotifyStatusText).text(message);
}

var songTl = anime.timeline ({
    easing: cbDefault,
    autoplay: false,
    loop: 3
});

const scrollDuration = 10000;
var scrollText = {
    scroll: function(target, scrollWidth, vpWidth, delay) {
        songTl.add({
            targets: target,
            delay: delay,
            translateX: - scrollWidth,
            duration: scrollDuration,
            complete: function() {
                target.style.translateX = 0;
            }
        })
        .add({
            targets: target,
            translateX: [vpWidth + 10, 0],
            duration: scrollDuration
        })
    },

    play: function(target, scrollWidth, vpWidth, delay) {
        this.scroll(target, scrollWidth, vpWidth, delay);
        songTl.restart();
    },

    stop: function(...targets) {
        songTl.pause();
        for (el of targets) {
            $(el).css('transform', 'translateX(0px)');
        }
    }
}
;
$(function() {
    //Clock selection 
    $(styleSelectorL).on('click', function() {
        if (clockIsStale()) {
            changeOption(0);
        }
        clearTimeout(screenSaverTimeout);
    }); // 0 moves to the left

    $(styleSelectorR).on('click', function() {
        if (clockIsStale()) {
            changeOption(1);
        }
        clearTimeout(screenSaverTimeout);
    }); // 1 moves to the right

    $(window).on('keydown', function(event) {
        const t = 15000
        switch (event.which) {
            case 37:
                if (clockIsStale() && currentPosition !== 0) {
                    changeOption(0);
                    enableScreenSaver(t);
                    clearTimeout(screenSaverTimeout);
                }
            break;
        
            case 39:
                if (clockIsStale() && currentPosition !== (options - 1)) {
                    changeOption(1);
                    enableScreenSaver(t);
                    clearTimeout(screenSaverTimeout);
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
;
const likeBtn = $('.like-btn'),
playBtn = $('.play-btn'),
playbackIcon = $('#playback-icon');

var deviceID = undefined,
randomSong = undefined,
playerIsReady = false,
songIsSelected = false,
playbackStarted = false,
favourite = false,
currentTrackId = '';

// *** Spotify Player *** // Cannot perform operation; no list was loaded

if (localStorage.userHasLogged === 'true' && compatibility.login) {
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
            name: 'Relaxing Clocks',
            getOAuthToken: function (callback) {
                if (localStorage.code) {
                    //We request a token for the first time
                    spotify.requestToken();
                }

                else if (localStorage.refreshToken) {
                    //We need to request a new token using the refresh_token
                    spotify.refreshToken();
                }

                $(document).on('loginCompleted', function () {
                    console.info(`Login Completed!`);
                    callback(sessionStorage.accessToken);
                });
            }
        });
        
        initSpotifyPlayer();
    }
}

function initSpotifyPlayer() {
    var currentTrack = {};

    const trackName = $('#track-name'),
    likeBtn = $('.like-btn'),
    artistName = $('#artist-name'),
    spotifyTrackInfo = $('#spotify-track-info'),
    spotifyIcon = $('#spotify-icon'),
    playbackIcon = $('#playback-icon');
    
    // Error handling
    player.addListener('initialization_error', function({message}) {
            console.error(message); 
    });
    player.addListener('authentication_error', function({message}) {
            console.error(message); 
    });
    player.addListener('account_error', function({message}) {
            console.error(message); 
    });
    player.addListener('playback_error', function({message}) {
            console.error(message); 
    });
    
    // Playback status updates
    player.addListener('player_state_changed', function(state) {
        currentTrack = state.track_window.current_track;

        if (state.paused) {
            paused = true;
            $(playbackIcon).removeClass('fa-pause');
            $(playbackIcon).addClass('fa-play');
        } else {
            paused = false;
            $(playbackIcon).removeClass('fa-play');
            $(playbackIcon).addClass('fa-pause');
        }

        if (currentTrack.id !== currentTrackId) {
            console.log('Playing a new track...');
            $(spotifyTrackInfo).removeClass('hide');
            $(spotifyPlaceholder).css('opacity', 0);
            if (currentTrack.album.images[1].url) {
                $(spotifyIcon).addClass('has-cover');
                $(spotifyIcon).css({
                    'background-image': `url(${currentTrack.album.images[1].url})`
                });
            }

            currentTrackId = currentTrack.id;
            scrollText.stop($(trackName), $(artistName));

            const spWidth = $(spotifyPlaceholder).width()

            $(trackName).text(currentTrack.name);
            var titleSize = $(trackName).get(0).scrollWidth
            if (titleSize - 5 > spWidth) {
                scrollText.play($(trackName).get(0), titleSize, spWidth, 2000);
            }

            $(artistName).text(function() {
                var text = '';
                const artists = currentTrack.artists;
                for (var i = 0; i < artists.length; i++) {
                    if (i == (artists.length - 1)) {
                        text += `${artists[i].name}`
                    } else {
                        text += `${artists[i].name}, `
                    }
                }
                return text
            });
            var artistNameSize = $(artistName).get(0).scrollWidth;
            if (artistNameSize - 5 > spWidth) {
                scrollText.play($(artistName).get(0), titleSize, spWidth, 4000);
            }
            setTimeout(spotify.isLiked(currentTrackId, false), 250);
        }
    });
    
    // Ready
    player.addListener('ready', function({device_id}) {
        setTimeout(function() {
            spotify.getUserDetails(false);
        }, 1000);
        playerIsReady = true;
        deviceID = device_id;
        spotify.selectSong()
        console.log('Ready with Device ID', deviceID);
    });
    
    // Not Ready
    player.addListener('not_ready', function({device_id}) {
        console.log('Device ID has gone offline', device_id);
    });
    
    // Connect to the player!
    player.connect();

    //Listeners
    $(playBtn).on('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy()) {
            if (!playbackStarted) {
                spotify.play(deviceID, randomSong);
            } else {
                player.getCurrentState().then(state => {
                    if (!state.paused) {
                        player.pause().then(() => {
                            console.log('Music Paused!');                        
                        });
                    } else {
                        player.resume().then(() => {
                            console.log('Playback Resumed!');
                        });
                    }
                });
            }
        }
    });

    $(likeBtn).on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy()) {
            spotify.isLiked(currentTrackId, true);
        }
    });

    $(playBtn).on('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!playerIsBusy()) {
            if (playbackStarted) {
                player.nextTrack().then(() => {
                    console.log('Skipped to next track!');
                });
            }
        }
    });
}
// *** END OF Spotify Player *** //

function playerIsBusy() {
    if (playerIsReady && songIsSelected && premium) {
        return false
    } else {
        return true
    }
}
 
;
const spotifyPlaceholder = $('#spotify-placeholder');

//Extract params from the hashedURL into the params array
var params = getUrlVars();
if (compatibility.login) {
    if (localStorage.userHasLogged === 'false') {
        if (params.state === undefined) {
            //The user has never logged before to the app
            generateUrl();
            $(spotifyPlaceholder).html('Login with <br> Spotify');
            updateStatusText('Login with Spotify to listen some relaxing beats');
        } else if (params.state && params.error === undefined) {
            //The user comes from the Spotify's authentication page
            //without errors
            console.log(params);
            if (params.state === localStorage.state) {
                //The state variables match, the authentication is completed,
                //the app will reload the page to clean the address bar
                localStorage.userHasLogged = 'true';
                localStorage.removeItem('state');
                localStorage.setItem('code', params.code);
                window.location.replace(redirectURI);
            } else {
                //The states don't match, the authentication failed
                throwAuthError('states do not match');
            }
        } else if (params.error) {
            //Spotify responded with an error during the authentication process
            throwAuthError(params.error);
        }
     } else if (localStorage.userHasLogged === 'true') {
        $(musicBox).removeClass('unlogged');
        $(musicBox).addClass('logged');
    }
} else {
    throwUncompatibilityErr();
}

function throwAuthError(error) {
    console.error(`Authentication Error, ${error}!`);
    $(spotifyPlaceholder).html('Authentication<br>Error :(');
    $(spotifyPlaceholder).addClass('error');
}
    
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function logout() {
    localStorage.userHasLogged = 'false';
    if (sessionStorage.accessToken) sessionStorage.removeItem('accessToken');
    if (sessionStorage.expires_at) sessionStorage.removeItem('expires_at');
    if (localStorage.refreshToken) localStorage.removeItem('refreshToken');
    localStorage.removeItem('verifier');
    localStorage.removeItem('state');
    window.location.replace(redirectURI);
}

function throwUncompatibilityErr() {
    $(musicBox).addClass('unsupported');
    $('#spotify-status-box').addClass('unavailable');

    if (compatibility.isMobile) {
        updateStatusText(`Connect from your PC to login with Spotify`)
        console.error('Unsupported device: Spotify does not currenty support login from smartphones or tablets');
    } else if (!compatibility.isMobile && !compatibility.urlEncoding) {
        updateStatusText(`Your browser doesn't seem to be compatible :(`)
        console.error('Unsupported device: Base64 encoding is not supported!');
    }
}
;
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
        $(logoutBtn).text('Login'); 
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
                    window.location.replace(spotifyURL);
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
                    alarm.dismiss();
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