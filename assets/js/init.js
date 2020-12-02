import $                                   from 'jquery';
import runCompatibilityDetector            from './compatibilityDetector';
import settingsPageHandler                 from './settingsPageHandler';
import displayDefaultClock                 from './clocks';
import { openFullscreen, closeFullscreen } from '../utils/js/fullScreenUtils';

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
export var hours,min,sec,
inSettings             = false, //if the user is currently in the settings page
settingsIsAnimating    = false,
paused                 = true, //the music state
screenSaverIsActive    = false, //whether or not the screen saver is active
screenSaverisAnimating = false, //whether or not the screen saver is animating
isFullScreen           = false, //whether or not the clock is in fullscreen
noSleep                = new NoSleep();

$(function() {
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

  //initialize the clock
  displayDefaultClock();
})

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

function handleLogSwitch() {
  if (localStorage.getItem('logs') === null) {
    console.log = function () { };
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
        $(logSwitch).css('color', 'rgb(245, 245, 245)').off('click');
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        location.reload();
      }
    });
  } else {
    $('#log-switch').css('color', 'rgb(245, 245, 245)');
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
        inSettings = false;
        settingsPageHandler.arrow(true);
        [$(musicBox), $(pomodoroBox)].forEach((el) => $(el).removeClass('hide'));
      } else {
        inSettings = true;
        settingsPageHandler.arrow(false);
        [$(musicBox), $(pomodoroBox)].forEach((el) => $(el).addClass('hide'));
      }
    }, 250)
  });
}

function handleExpandIcon() {
  $(expandIcon).on('click', function (event) {
    event.stopPropagation(); //avoid bubbling of the event
    (document.fullscreenElement === null) ? openFullscreen() : closeFullscreen();
  });
}