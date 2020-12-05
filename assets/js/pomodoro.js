import { checkNotificationStatus,
        changeBtnLable }            from "../utils/js/utils";
import { pomodoroBox }              from "./init";
import { compatibility }            from "./compatibilityDetector";

export const pomodoro = {

    running: false,

    timeout: undefined,

    notificationStatus: false,

    notifications: function(status) {
        const pomodoroNotifBox = $('#pomodoro-notif-box span');
        const notifText = 'Send a notification on each cycle';

        if (status) {
            checkNotificationStatus($(pomodoroNotifBox)).then((notif) => {
                if (notif) {
                    this.notificationStatus = true;
                    changeBtnLable($(pomodoroNotifBox), notifText);
                    console.log(`Pomodoro notifications enabled`);
                }
            })
        } else {
            this.notificationStatus = false;
            if ($(pomodoroNotifBox).text() !== notifText) changeBtnLable($(pomodoroNotifBox), notifText);
            console.log(`Pomodoro notifications disbled`);
        }
    },

    workingCycle: function() {
        if (localStorage.longPomodoro === 'false') {
            return 1000 * 60 * 25
        } else if (localStorage.longPomodoro === 'true') {
            return 1000 * 60 * 45
        }
    },

    relaxingCycle: function () {
        if (localStorage.longPomodoro === 'false') {
            return 1000 * 60 * 5
        } else if (localStorage.longPomodoro === 'true') {
            return 1000 * 60 * 15
        }
    },

    start: function() {
        this.running = true;
        clearTimeout(this.timeout);
        [$(pomodoroBox), $('#pomodoro-lable-box')].forEach((el) => {
            $(el).removeClass('force-hide relaxing')
            setTimeout(() => { $(el).addClass('working') }, 200)
        });

        if (compatibility.notification && (Notification.permission !== 'denied')) {
            $('#pomodoro-notif-box').removeClass('unavailable');
        }

        $('#pomodoro-long-box').addClass('unavailable');
        $('#set-pomodoro-btn').addClass('btn-dismiss');
        const cycleLenght = this.workingCycle();
        console.log(`Starting Pomodoro Timer for ${cycleLenght / (60 * 1000)} minutes...`);
        changeBtnLable($('#pomodoro-lable'), `Focus on your work!`);
        this.timeout = setTimeout(() => {
            pomodoro.relax();
            document.querySelector('#pomodoro-sound').play();
            if (document.visibilityState !== 'visible' && pomodoro.notificationStatus) {
                new Notification(`IT'S TIME TO RELAX!`, {
                    lang: 'EN',
                    body: 'Empty your ming',
                    requireInteraction: false,
                    icon: `${redirectURI}/img/grinning-face.png`
                });
            }
        }, cycleLenght);
    },

    relax: function() {
        clearTimeout(this.timeout);
        [$(pomodoroBox), $('#pomodoro-lable-box')].forEach((el) => {
            $(el).removeClass('working')
            setTimeout(() => { $(el).addClass('relaxing') }, 200)
        });
        
        const cycleLenght = this.relaxingCycle();
        console.log(`Starting Pomodoro Timer for ${cycleLenght / (60 * 1000)} minutes...`);
        changeBtnLable($('#pomodoro-lable'), `Time to relax! Empty your mind :)`);
        this.timeout = setTimeout(() => {
            pomodoro.start();
            document.querySelector('#pomodoro-sound').play();
            if (document.visibilityState !== 'visible' && pomodoro.notificationStatus) {
                new Notification(`IT'S TIME TO WORK!`, {
                    lang: 'EN',
                    body: 'Focus on your tasks',
                    requireInteraction: false,
                    icon: `${redirectURI}/img/face-glasses.png`
                });
            }
        }, cycleLenght);
    },

    stop: function() {
        this.running = false;
        clearTimeout(this.timeout);
        console.log('Dismissed pomodoro timer');
        
        [$(pomodoroBox), $('#pomodoro-lable-box')].forEach((el) => {
            $(el).removeClass('working relaxing') });
        $(pomodoroBox).addClass('force-hide')
        $('#pomodoro-long-box').removeClass('unavailable');
        $('#set-pomodoro-btn').removeClass('btn-dismiss');
        $('#pomodoro-notif-box').addClass('unavailable');
        changeBtnLable($('#pomodoro-lable'), `Start the timer`);
    }
}