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