var handColor, circleIsdrawn = false, circlePathTl;
const cityName = $('.city-name'), cityIcon = $('#city-icon');
var clockStyles = {
    //0
    handleClassicClock: function() {
        const mySec = sec;
        if (hours == '04' && min == '20' && clockFormat === '12h') {
            mySec = '69';
        }

        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min + ':' + mySec);
        } else {
            $(bigClock).text(hours + ' ' + min + ' ' + mySec);
        }
    },
    //1
    handleFocusedClock: function() {
        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min);
        } else {
            $(bigClock).text(hours + ' ' + min);
        }
    },
    //2
    handleMetroClock: function() {
        if (sec % 2 == 0) {
            $(bigClock).html(hours + '<br>' + '·' + '<br>' + min);
        } else {
            $(bigClock).html(hours + '<br>' + ' ' + '<br>' + min);
        }
    },
    
    //3
    handleAnalogClock: function() {
        var handhours = $('#hand-hours');
        var handmin = $('#hand-min');
        var handsec = $('#hand-seconds');
        
        if (!circleIsdrawn) {
            if (document.readyState === 'complete') {
                computeAnalogSize();
            } else {
                $(window).on('load', function() {
                    computeAnalogSize();
                });
            }
        } else {
            fullHandMovement();
        }
        
        async function computeAnalogSize() {
            $(window).off('load');
            var ccMargin = parseInt($(clockContainer).css('margin-bottom'))
            var cicHeight = $(clockContainer).height();
            var circle = $('#circle');
            var circleRadius = ((ccMargin) + cicHeight / 2);
            var circleDiameter = circleRadius * 2;
            $(circle).width(circleDiameter);
            $(circle).height(circleDiameter);
            
            $(handsec).height((circleRadius * 80) / 100);
            $(handmin).height((circleRadius * 60) / 100);
            $(handhours).height((circleRadius * 40) / 100);
            
            circleIsdrawn = true;
            
            fullHandMovement();
        }
        
        function fullHandMovement() {
            $(handhours).css('transform', `translate(-50%, -100%) rotate(${(hours * 30) + (min / 2)}deg)`);
            $(handmin).css('transform', `translate(-50%, -100%) rotate(${(min * 6) + (sec / 10)}deg)`);
            $(handsec).css({
                'transform': `translate(-50%, -100%) rotate(${sec * 6}deg)`,
                'background-color': handColor
            });
        }
    },

    randomHandColor: function() {
        handColor = randomColor({luminosity: 'light'});
    },

    //4
    handleGlobeClock: function() {
        $(cityIcon).addClass(aRandomPlace.class);
        $(cityName).text(aRandomPlace.city);
        if (sec % 2 == 0) {
            $(bigClock).text(hours + ':' + min + ':' + sec);
        } else {
            $(bigClock).text(hours + ' ' + min + ' ' + sec);
        }
    },

    handleGlobeAnimation: function(pathAnimation = true) {
        if (document.readyState === 'complete') {
            globeClockAnimation();
        } else {
            $(window).on('load', function() {
                $(centerContainer).addClass('globe');
                globeClockAnimation()
            });
        }
        
        function globeClockAnimation() {
            const halfCirPath = $('#half-circle-path'),
            bigClockContainer = $('.big-clock-container'),
            clockFormatBtns = [$(format12), $(format24)];
            if (circleTl !== undefined) {
                circleTl.pause();
            }
            
            const circlePath = {
                animateCirclePath: function() {
                    globeInAction = true;
                    
                    circlePathTl = anime.timeline({
                        begin: function() {
                            for (const el of clockFormatBtns) {
                                $(el).addClass('unfocus');
                            }
                            $(styleSelectorL).addClass('overscroll');
                            $(styleSelectorR).addClass('overscroll');
                        },
                        duration: 3000,
                        easing: cbDefault,
                        autoplay: false,
                        complete: function() {
                            globeInAction = false;
                            $(styleSelectorL).removeClass('overscroll');
                            $(styleSelectorR).removeClass('overscroll');
                            (clockFormat === '12h') ? $(format12).removeClass('unfocus') : $(format24).removeClass('unfocus');
                            circlePath.createSkyIcon();
                        }
                    })
                        .add({
                            targets: $(halfCirPath).get(0),
                            strokeDashoffset: [anime.setDashoffset, 0],
                            loop: false,
                            direction: 'normal',
                        });
                    
                    circlePathTl.pause();
                    circlePathTl.restart();
                },
                
                createSkyIcon: function() {
                    if (!$(skyIcon).length) {
                        //use the .length property to check if the element already exists, return false if it doesn't
                        $('<span />', {
                            id: 'sky-icon',
                        }).appendTo(clockInnerCont);
                        var skyIconH = $(skyIcon).height();
                        var skyIconW = $(skyIcon).width();
                        $(skyIcon).css({
                            'bottom': halfCircle.height + 50 - (skyIconH / 2),
                            'left': skyIconW / (-2)
                        });
                    } 

                    this.animateSkyIcon();
                },
                
                animateSkyIcon: function() {
                    const skyIconTime = 1500;
                    circleTl = anime.timeline({
                        duration: (1000 * 20),
                        autoplay: true,
                        loop: false,
                        begin: () => {
                            loadTime(clockFormat, aRandomPlace.tz);
                            clockStyles.handleGlobeClock();
                            if (isDay) {
                                $(skyIcon).removeClass('moon').addClass('sun');
                            } else {
                                $(skyIcon).removeClass('sun').addClass('moon');
                            }
                        },
                        complete: () => {
                            circleTl.pause()
                            if (currentPosition === 4) this.animateSkyIcon()
                        }
                    });
                    
                    circleTl
                        .add({
                            targets: $(skyIcon).get(0),
                            translateX: animePath('x'),
                            translateY: animePath('y'),
                            translateZ: 0,
                            easing: getCbCurve(),
                            opacity: {
                                value: [0, 1],
                                duration: 500,
                                easing: cbDefault,
                            },
                        }, 0)
                        .add({
                            targets: [$(bigClockContainer).get(0), $(cityName).get(0), $(skyIcon).get(0)],
                            opacity: [1, 0],
                            direction: 'alternate',
                            easing: 'easeInOutSine',
                            duration: skyIconTime,
                            loopComplete: function() {
                                $(cityIcon).removeClass();
                                getRandomPlace();
                                loadTime(clockFormat, aRandomPlace.tz);
                                clockStyles.handleGlobeClock();
                            },
                        }, `-=${skyIconTime}`);
                }
            }
            
            $(window).off('load');
            var skyIcon = '#sky-icon';
            if ($(skyIcon).length) {
                $('#sky-icon').remove();
            }
            
            halfCircle = computeCircleSize();
            const animePath = anime.path(halfCircle.path);
            
            if(pathAnimation) {
                circlePath.animateCirclePath();
            } else {
                halfCirPath.get(0).setAttribute('stroke-dasharray', 10000);
                if (circlePathTl) circlePathTl.pause();
                circlePath.createSkyIcon();
            }
            
            //Calculates the size of the half circle
            function computeCircleSize() {
                const cPathDashed = $('#half-circle-dashed'),
                cicWidth = clockInnerCont.width(),
                cicHeight = clockInnerCont.height();
                const halfCircleRadius = cicWidth / 2;
                const halfCircleSize = `M 0 ${cicHeight} A ${halfCircleRadius} ${halfCircleRadius} 180 0 1 ${cicWidth} ${cicHeight}`;
                $(halfCirPath).attr('d', halfCircleSize);
                $(cPathDashed).attr('d', halfCircleSize);
                return {
                    path : $(halfCirPath).get(0),
                    width : cicWidth,
                    height : cicHeight
                };
            }
        }
    },
}