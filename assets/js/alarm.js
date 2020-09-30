const arrows = $('#alarm-big-clock').find('.arrow'),
    alarmSection = $('#alarm-section');
var alarmTime, ringTl;

var alarm = {
    
    at: undefined,

    alarmTimeout : undefined,

    enabled: false,

    oldPlaybackState: {
        status: false, //if the playback was paused or not (true if it was, false if it was playing)
        volume: undefined,
    },

    notificationStatus: false,

    notifications: function(enabled) {
        const perm = Notification.permission

        if (enabled) {
            if (perm === 'granted') {
                this.notificationStatus = true;
                console.log(`Alarm notifications enabled`);
            } else if (perm !== 'denied' || perm === "default") {
                console.warn(`Alarm notifications: missing permission!`);
                Notification.requestPermission()
                .then(function (result) {
                    if (result === 'granted') {
                        this.notificationStatus = true;
                    }
                })
            }
        } else {
            this.notificationStatus = false;
            console.log(`Alarm notifications disbled`);
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
        
        if (moment().isBefore(when)) {
            alarm.enabled = true;
            localStorage.setItem('alarmTime', alarmTime.unix());
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
        }

        this.closePage();
    },

    dismiss: function (closePage = true) {
        console.log('Dismissed alarm!');

        this.ring(false);
        if (closePage) this.closePage();
        clearInterval(this.at);
        clearTimeout(this.alarmTimeout);
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

    handleMusic: function(turnDown) {
        if (player !== undefined) {
            if (turnDown) {
                this.oldPlaybackState.status = paused;
                player.getVolume().then(volume => {
                    this.oldPlaybackState.volume = volume;
                    if (!this.oldPlaybackState.status) {
                        const newVolume = 0.2;
                        if (newVolume <= volume) player.setVolume(newVolume);
                    }
                });


                if (!this.oldPlaybackState.status) {
                    const newVolume = 0.2;
                    if (newVolume <= this.oldPlaybackState.volume) player.setVolume(newVolume);
                }
            } else {
                if (this.oldPlaybackState.volume !== undefined) {
                    player.setVolume(this.oldPlaybackState.volume);
                    player.resume();
                }
            }
        }
    },

    ring: function (ringing = true) {

        if (ringing) {
            inSettings = true;
            $(alarmSection).addClass('ring');
            $('#big-container').addClass('blur');
            $(alarmSection).removeClass('show');
            this.handleMusic(true);

            $(this.alarmSet).on('click', (event) => { event.stopPropagation(); this.snooze() });
            $(this.alarmDismiss).on('click', (event) => { event.stopPropagation(); this.dismiss() });

            document.querySelector('#alarm-sound').play();

            if (document.visibilityState !== 'visible' && alarm.notificationStatus) {
                const alarmFormat = (clockFormat === '24h') ? alarmTime.format('HH:mm') : alarmTime.format('hh:mm');
                const alarmNotif = new Notification(`IT'S ${alarmFormat} WAKE UP!!!`, {
                    lang: 'EN',
                    body: 'The alarm is ringing',
                    requireInteraction: true,
                    icon: `${redirectURI}/img/clock.png`
                });
            }
            
            this.alarmTimeout = setTimeout(() => { this.dismiss() }, (90 * 1000));

            this.animateRing(true);
            
        } else {
            this.animateRing(false);
            $(document).off('visibilitychange');
            document.querySelector('#alarm-sound').pause();
            this.handleMusic(false);
        }

        localStorage.removeItem('alarmTime');
    },

    animateRing: function(start) {
        const tl = { duration: 350, easing: 'linear', autoplay: false, loop: false };
        ringTl = anime.timeline(tl);

        if (start) {
            let bgone, bgtwo;

            bgone = randomColor({ luminosity: 'light', format: 'rgba', alpha: 0.9 });
            bgtwo = randomColor({ luminosity: 'light', format: 'rgba', alpha: 0.9 });

            const ringTll = anime.timeline(tl);

            anime({
                targets: $(alarmSection).get(0),
                duration: 100,
                easing: cbDefault,
                opacity: [0, 1],
            });

            ringTl.add({
                update: function (percent) {
                    $(alarmSection).get(0).style.background = `radial-gradient(circle, ${bgone} ${(percent.progress) / 2}%, ${bgtwo} ${(percent.progress) * 2}%)`
                },
                complete: function () {
                    ringTll.restart()
                }
            }, 0);

            ringTll.add({
                update: function (percent) {
                    $(alarmSection).get(0).style.background = `radial-gradient(circle, ${bgtwo}  ${(percent.progress)}%, ${bgone} ${(percent.progress) * 2}%)`
                },
                complete: function () {
                    setTimeout(function () {
                        ringTl.restart();
                    }, 250)
                }
            }, 0);

            ringTl.restart();
        } else {
            ringTl.pause();
        }
    },

    closePage: function () {   
        anime({
            begin: () => { $('#big-container').removeClass('blur') },
            targets: $(alarmSection).get(0),
            duration: 350,
            easing: cbDefault,
            opacity: [1, 0],
            complete: () => { 
                $(this.tomorrowBox).empty();
                this.removeAlarmListeners();
                $(body).removeClass('unscrollable');
                $(alarmSection).removeClass('show ring');
            }
        });
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

if (localStorage.getItem('alarmTime') !== null) {
    console.log('Restored old alarm');
    
    const savedAlarm = parseInt(localStorage.alarmTime);
    if (savedAlarm + 900 > moment().unix() && moment().unix() < savedAlarm) {
        alarm.init();
        alarmTime = moment.unix(savedAlarm);
        alarm.set(alarmTime);    
    }
}