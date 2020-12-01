import { settingsIsAnimating, settingsArrow, eaElasticDefault, inSettings } from "./init";

export const settingsPageHandler = {
    openSettings: function (moveDown) {
        settingsIsAnimating = true;
        anime({
            targets: 'html, body',
            duration: 1250,
            scrollTop: (moveDown) ? (($(window).height()) * 0.7) : 0,
            easing: (moveDown) ? eaElasticDefault : 'easeOutExpo',
            complete: function () {
                inSettings = (moveDown) ? true : false;
                settingsIsAnimating = false;
            }
        });
    },

    arrow: function (pointUp) {
        anime({
            targets: $(settingsArrow).get(0),
            duration: 650,
            easing: 'easeOutBack',
            rotate: (pointUp) ? 0 : 180,
            translateX: '-50%',
            complete: function () {
                if (pointUp) {
                    $(settingsArrow).find('#open-settings-arrow').removeClass('in-settings');
                } else {
                    $(settingsArrow).find('#open-settings-arrow').addClass('in-settings');
                }
            }
        });
    },
}