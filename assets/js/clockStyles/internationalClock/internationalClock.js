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

    return aRandomPlace;
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
    }
}