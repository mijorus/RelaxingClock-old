import { runCompatibilityDetector }        from './compatibilityDetector';
import { settingsPageHandler, 
        settingsIsAnimating, 
        userInSettings,
        inSettings }                       from './settingsPageHandler';
import { displayDefaultClock }             from "./clocks";
import { handleExpandIcon }                from './utils/fullScreenUtils';
import { getSettings }                     from "./getSettings";
import { musicBox,
        initSpotifyAuthProcess }           from "./spotify/init";

export const body = $('body'),
main              = $('main'),
bigClock          = $('#big-clock'),
expandIcon        = $('.expand-icon'),
toScreenSave      = $('.toscreensave'),
pomodoroBox       = $('#pomodoro-feature-box'),
settingsArrow     = $('#open-settings-container'),
clockInnerCont    = $('#clock-inner-container'),
clockContainer    = $('#clock-container'),
cbDefault         = 'cubicBezier(0.37, 0, 0.63, 1)',
eaElasticDefault  = 'easeOutElastic(1, 1)';

export function init() {
  //Test if all the features are supported
  runCompatibilityDetector();

  //Cookie Banner
  cookieBanner();

  //Handle Log switch
  handleLogSwitch();
  
  //Create loaders effects
  $('.loader').loaders();

  //Handle expand icon
  handleExpandIcon();

  //Handle settings page button
  handleSettingsPageBtn();

  //Handle window scrolling
  handleWindowScrolling();

  //Get user settings
  getSettings();

  //Initialize the clock
  displayDefaultClock();
  
  //Initialize spotify's authorization process
  initSpotifyAuthProcess();
}

function cookieBanner() {
  if (localStorage.getItem('cookie') === null) {
    $('#cookie').show();
    $('#cookie-dismiss').on('click', () => {
      $('#cookie').remove();
      localStorage.setItem('cookie', '1');
      $('#cookie-dismiss').off('click');
    });
  } else {
    $('#cookie').remove();
  }
}

const bgColor = 'rgb(245, 245, 245)';
function handleLogSwitch() {
  if (localStorage.getItem('logs') === null) {
    //console.log = function () { };
    const logSwitch = $('#log-switch');

    let logsClickCounter = 0, logsTimeout;
    $(logSwitch).on('click', () => {
      clearTimeout(logsTimeout);
      logsClickCounter++
      if (logsClickCounter < 5) {
        logsTimeout = setTimeout(() => {
          logsClickCounter = 0;
        }, 250)
      } else {
        localStorage.setItem('logs', 'true');
        $(logSwitch).css('color', bgColor).off('click');
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        location.reload();
      }
    });
  } else {
    $('#log-switch').css('color', bgColor);
  }
}

function handleSettingsPageBtn() {
  $(settingsArrow).on('click', function (event) {
    event.stopPropagation();
    if (!inSettings && !settingsIsAnimating) {
      settingsPageHandler.openSettings(true);
    } else if (settingsPageHandler && !settingsIsAnimating) {
      settingsPageHandler.openSettings(false);
    }
  });
}

function handleWindowScrolling() {
  let waitScroll;
  $(window).on('scroll', function (event) {
    event.stopPropagation()
    clearTimeout(waitScroll);

    waitScroll = setTimeout(function () {
      if ($(window).scrollTop() === 0) {
        userInSettings(false);
        settingsPageHandler.arrow(true);
        [$(musicBox), $(pomodoroBox)].forEach((el) => $(el).removeClass('hide'));
      } else {
        userInSettings(true);
        settingsPageHandler.arrow(false);
        [$(musicBox), $(pomodoroBox)].forEach((el) => $(el).addClass('hide'));
      }
    }, 250)
  });
}

