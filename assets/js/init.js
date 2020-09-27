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
player = undefined, paused = true, //the music state
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

