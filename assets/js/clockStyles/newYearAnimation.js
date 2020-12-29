/*
    Based on a pen by @juliangarnier
    https://codepen.io/juliangarnier/pen/gmOwJX
*/
import { main } from "../init";
var canvasEl, ctx;
var render;
var numberOfParticules = 30;
var colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C'];
var stop = true;

export var launched = false;

export function launchNewYearAnimation() {
    console.log('launching new year animation!');
    canvasEl = $('<canvas id="canvas-new-year" class="top-left-0"></canvas>');
    $(main).append(canvasEl)
    setCanvasSize();
    defineRender();

    stop = false;
    launched = true;

    ctx = $(canvasEl).get(0).getContext('2d');

    autoClick();
    render.play();
    setTimeout(stopNewYearAnimation, 40 * 1000)
}

export function stopNewYearAnimation() {
    stop = true;
    launched = false;
    $(canvasEl).remove();
}

function setCanvasSize() {
    $(canvasEl).get(0).width = $(main).width() * 2;
    $(canvasEl).get(0).height = $(main).height() * 2;
    $(canvasEl).width( $(main).width() );
    $(canvasEl).height( $(main).height() );
    $(canvasEl).get(0).getContext('2d').scale(2, 2);
}

function setParticuleDirection(p) {
    var angle = anime.random(0, 360) * Math.PI / 180;
    var value = anime.random(50, 180);
    var radius = [-1, 1][anime.random(0, 1)] * value;
    return {
        x: p.x + radius * Math.cos(angle),
        y: p.y + radius * Math.sin(angle)
    }
}

function createParticule(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = colors[anime.random(0, colors.length - 1)];
    p.radius = anime.random(16, 32);
    p.endPos = setParticuleDirection(p);
    p.draw = function () {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
    return p;
}

function createCircle(x, y) {
    var p = {};
    p.x = x;
    p.y = y;
    p.color = '#FFF';
    p.radius = 0.1;
    p.alpha = .5;
    p.lineWidth = 6;
    p.draw = function () {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
        ctx.lineWidth = p.lineWidth;
        ctx.strokeStyle = p.color;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    return p;
}

function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
        anim.animatables[i].target.draw();
    }
}

function animateParticules(x, y) {
    var circle = createCircle(x, y);
    var particules = [];
    for (var i = 0; i < numberOfParticules; i++) {
        particules.push(createParticule(x, y));
    }
    anime.timeline()
        .add({
            targets: particules,
            x: function (p) { return p.endPos.x; },
            y: function (p) { return p.endPos.y; },
            radius: 0.1,
            duration: anime.random(1200, 1800),
            easing: 'easeOutExpo',
            update: renderParticule
        })
        .add({
            targets: circle,
            radius: anime.random(80, 160),
            lineWidth: 0,
            alpha: {
                value: 0,
                easing: 'linear',
                duration: anime.random(600, 800),
            },
            duration: anime.random(1200, 1800),
            easing: 'easeOutExpo',
            update: renderParticule,
            offset: 0
        });
}

function defineRender() {
    render = anime({
        duration: Infinity,
        update: function () {
            ctx.clearRect(0, 0, $(canvasEl).width(), $(canvasEl).height());
        }
    });
}

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;

function autoClick() {
    if (stop) {
        return
    } else {
        animateParticules(
            anime.random(centerX - (centerX - 20), centerX + (centerX - 20)),
            anime.random(centerY - (centerY - 20), centerY + (centerY - 20))
        );

        anime({ duration: 200 }).finished.then(autoClick);
    }
}