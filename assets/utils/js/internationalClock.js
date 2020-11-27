export var aRandomPlace = null, isDay, circlePercentage;
//gets a random city from an array
const cities = [
    {
        city : 'Paris',
        tz : 'Europe/Paris',
        lat : 48,
        long : 2,
        class: 'paris'
    },
    {
        city : 'New York',
        tz : 'America/New_York',
        lat : 40,
        long : -74,
        class: 'newyork'
    },
    {
        city : 'Hong Kong',
        tz : 'Asia/Hong_Kong',
        lat : -33,
        long : 151,
        class: 'hongkong'
    },
    {
        city : 'Sydney',
        tz : 'Australia/Sydney',
        lat : -22,
        long : 144,
        class: 'sydney'
    },
    {
        city : 'New Delhi',
        tz : 'Asia/Kolkata',
        lat : 28,
        long : 77,
        class: 'delhi'
    },
    {
        city : 'London',
        tz : 'Europe/London',
        lat : 51,
        long : 0,
        class: 'london'
    },
    {
        city : 'Rome',
        tz : 'Europe/Paris',
        lat : 41,
        long : 12,
        class: 'rome'
    },
    {
        city : 'Beijin',
        tz: 'Asia/Shanghai',
        lat : 39,
        long : 116,
        class: 'beijin'
    },
    {
        city: 'Toronto',
        tz: 'America/Toronto',
        lat: 43,
        long: -79,
        class: 'toronto'
    },
]

const firstCity = (Math.floor(Math.random() * (cities.length)));
var currentCity;
//saves a random place in a variable
function getRandomPlace(getTz = true) {
    if (aRandomPlace === null) {
        aRandomPlace = cities[firstCity];
        currentCity = firstCity;
    } else {
        if (currentCity + 1 >= cities.length) {
            aRandomPlace = cities[0]
            currentCity = 0;
        } else {
            currentCity = currentCity + 1
            aRandomPlace = cities[currentCity];
        }
    }

    if (getTz) {
        console.log(aRandomPlace.city, moment.tz(aRandomPlace.tz).format('HH mm ss'));
        var sunc = SunCalc.getTimes(new Date(), aRandomPlace.lat, aRandomPlace.long);
        var now = moment().valueOf();
        const millsecInDay = moment.duration(24, 'hours').asMilliseconds();

        const sunrise = sunc.sunrise.getTime(),
            sunset = sunc.sunset.getTime();

        console.log(sunc.sunrise, sunc.sunset, now);

        isDay = getDay();

        if (isDay) {
            console.log(`We are at about ${circlePercentage}% of the day in ${aRandomPlace.city}`);
        } else {
            console.log(`We are at about ${circlePercentage}% of the night in ${aRandomPlace.city}`);

        }

        function getDay() {

            if (now > sunrise && now >= sunset) {
                circlePercentage = getPercentage(sunset, sunrise + millsecInDay, now)
                return false

            } else if (sunset <= now && sunrise > now) {
                circlePercentage = getPercentage(sunset, sunrise, now);
                return false

            } else if (sunrise >= now && sunset > now) {
                circlePercentage = getPercentage((sunset - millsecInDay), sunrise, now)
                return false

            } else if (sunrise <= now && sunset > now) {
                circlePercentage = getPercentage(sunrise, sunset, now)
                return true
            }
        }
    }
}

export function getCbCurve() {
    var customCB = {
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
    return customCB[circlePercentage];
}

export function getPercentage(zero, hundred, x) {
    // console.log(zero, hundred, x);
    hundred = hundred - zero;
    x = x - zero;
    var h = hundred / 100;
    var result = Math.round((x / h) / 10) * 10;
    return result
}