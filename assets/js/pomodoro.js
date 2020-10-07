var pomodoro = {

    running: false,

    timeout: undefined,

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
        $('#pomodoro-lable-box').removeClass('relaxing').addClass('working');
        $('#pomodoro-long-box').addClass('unavailable');
        $('#set-pomodoro-btn').addClass('btn-dismiss');
        const cycleLenght = this.workingCycle();
        console.log(`Starting Pomodoro Timer for ${cycleLenght / (60 * 1000)} minutes...`);
        changeBtnLable($('#pomodoro-lable'), `Focus on your work!`);
        this.timeout = setTimeout(() => {
            pomodoro.relax();
            document.querySelector('#pomodoro-sound').play();
        }, cycleLenght);
    },

    relax: function() {
        clearTimeout(this.timeout);
        $('#pomodoro-lable-box').removeClass('working').addClass('relaxing');
        const cycleLenght = this.relaxingCycle();
        console.log(`Starting Pomodoro Timer for ${cycleLenght / (60 * 1000)} minutes...`);
        changeBtnLable($('#pomodoro-lable'), `Time to relax! Empty your mind :)`);
        this.timeout = setTimeout(() => {
            pomodoro.start();
            document.querySelector('#pomodoro-sound').play();
        }, cycleLenght);
    },

    stop: function() {
        this.running = false;
        clearTimeout(this.timeout);
        console.log('Dismissed pomodoro timer');
        $('#pomodoro-lable-box').removeClass('working relaxing');
        $('#pomodoro-long-box').removeClass('unavailable');
        $('#set-pomodoro-btn').removeClass('btn-dismiss');
        changeBtnLable($('#pomodoro-lable'), `Start the timer`);
    }
}