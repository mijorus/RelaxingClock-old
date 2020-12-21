import { cities } from "./cities";

export var aRandomPlace = {
    city: undefined,
    day: function() {
        return getDayStatus()
    },
}
//Gets a random city from an array
const firstCity = (Math.floor(Math.random() * (cities.length)));
var currentCity;

//Saves a random place in a variable
export function newRandomPlace() {
    if (aRandomPlace.city === undefined) {
        currentCity = firstCity;
    } else {
        if (currentCity + 1 >= cities.length) {
            currentCity = 0;
        } else {
            currentCity = currentCity + 1
        }
    }
    
    aRandomPlace.city = cities[currentCity]
}

function getCbCurve(percentage) {
    const customCB = {
         0: 'cubicBezier(1,.03,.9,.44)',
        10: 'cubicBezier(.24,.3,.88,-0.31)',
        20: 'cubicBezier(.27,.55,.9,-0.27)',
        30: 'cubicBezier(.43,.68,.84,-0.18)',
        40: 'cubicBezier(.39,.85,.84,-0.12)',
        50: 'cubicBezier(0,1,1,0)',
        60: 'cubicBezier(.35,1.08,.92,.22)',
        70: 'cubicBezier(.33,1.2,.84,.28)',
        80: 'cubicBezier(.37,1.24,.88,.43)',
        90: 'cubicBezier(.28,1.3,.82,.67)',
       100: 'cubicBezier(.12,1.12,.74,.93)'
    }

    return customCB[percentage];
}

function getDayPercentage(zero, hundred, x) {
    hundred = hundred - zero;
    x = x - zero;
    const h = hundred / 100;
    return Math.round((x / h) * 10) / 10;
}

function getDayStatus() {
    const sunc = SunCalc.getTimes(new Date(), aRandomPlace.city.lat, aRandomPlace.city.long);
    const now = moment().valueOf();
    const millsecInDay = moment.duration(24, 'hours').asMilliseconds();

    const sunrise = sunc.sunrise.getTime();
    const sunset = sunc.sunset.getTime();

    let isDay, circlePercentage;
    if (now > sunrise && now >= sunset) {
        circlePercentage = getDayPercentage(sunset, sunrise + millsecInDay, now)
        isDay = false

    } else if (sunset <= now && sunrise > now) {
        circlePercentage = getDayPercentage(sunset, sunrise, now);
        isDay = false

    } else if (sunrise >= now && sunset > now) {
        circlePercentage = getDayPercentage((sunset - millsecInDay), sunrise, now)
        isDay = false

    } else if (sunrise <= now && sunset > now) {
        circlePercentage = getDayPercentage(sunrise, sunset, now)
        isDay = true
    }

    (isDay)
        ? console.log(`We are at about ${circlePercentage}% of the day in ${aRandomPlace.city.name}`)
        : console.log(`We are at about ${circlePercentage}% of the night in ${aRandomPlace.city.name}`);

    return { 
        isDay: isDay,
        percentage: circlePercentage,
        // cbCurve: function() {
        //     return getCbCurve(circlePercentage)
        // }
    }
}

// function getDayPercentage() {
//     console.log(aRandomPlace.city, moment.tz(aRandomPlace.tz).format('HH mm ss'));


//     console.log(sunc.sunrise, sunc.sunset, now);

//     // if (isDay()) {
//     //     console.log(`We are at about ${circlePercentage}% of the day in ${aRandomPlace.city}`);
//     // } else {
//     //     console.log(`We are at about ${circlePercentage}% of the night in ${aRandomPlace.city}`);

//     // }
// }