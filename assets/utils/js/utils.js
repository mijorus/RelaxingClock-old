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

//Change button lable with animation
function changeBtnLable(target, nextMessage, dur = 650) {
    anime({
        targets: $(target).get(0),
        direction: 'alternate', duration: dur, 
        loop: 1, easing: cbDefault, opacity: [1, 0],
        loopComplete: () => {
            $(target).text(`${nextMessage}`);
        }
    });
}






// anime({
//     targets: $(alarm.alarmLable).get(0),
//     direction: 'alternate', duration: 650, loop: 1, easing: cbDefault, opacity: [1, 0],
//     loopComplete: () => {
//         $(alarm.alarmLable).text(`Rings ${this.timeToAlarm().toLowerCase()}`);
//     }
// });