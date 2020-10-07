var pomodoro = {

    running: false,

    timeout: undefined,

    start: function() {
        this.running = true;
        changeBtnLable($('#pomodoro-lable'), `Focus on your work!`);
        setTimeout(() => {
            changeBtnLable($('#pomodoro-lable'), `Relax`);
        }, 1000 * 60 * 25)
    }

}